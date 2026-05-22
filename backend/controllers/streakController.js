// backend/controllers/streakController.js
import Streak from '../models/Streak.js';
import { generateContent } from '../services/geminiService.js';
import asyncHandler from '../middleware/asyncHandler.js';

const toDateString = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const getYesterdayString = (todayStr) => {
  const d = new Date(todayStr + 'T12:00:00.000Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
};

const getChallengeTypeForDay = (dayOfWeek) => {
  if (dayOfWeek === 0) return 'summary';
  if (dayOfWeek === 1 || dayOfWeek === 4) return 'mcq';
  if (dayOfWeek === 2 || dayOfWeek === 5) return 'flashcard';
  return 'mock_question';
};

const findOrCreateStreak = async (userId) => {
  let streak = await Streak.findOne({ userId });
  if (!streak) {
    streak = await Streak.create({ userId });
  }
  return streak;
};

// 👇 Fallback questions when Groq is rate limited or unavailable
const FALLBACK_CHALLENGES = {
  flashcard: {
    type: 'flashcard',
    question: 'What is the difference between monolithic and microservices architecture?',
  },
  mcq: {
    type: 'mcq',
    question: 'Which data structure uses LIFO (Last In First Out) order? A) Queue  B) Stack  C) LinkedList  D) Tree',
  },
  mock_question: {
    type: 'mock_question',
    question: 'Explain the concept of closures in JavaScript with an example.',
  },
  summary: {
    type: 'summary',
    question: 'Summarize the key differences between SQL and NoSQL databases.',
  },
};

export const getToday = asyncHandler(async (req, res) => {
  const todayStr = toDateString(new Date());
  const challengeType = getChallengeTypeForDay(new Date().getDay());

  // 👇 Guest users: skip DB and AI entirely, return defaults immediately
  if (req.user?.role === 'guest') {
    return res.status(200).json({
      success: true,
      data: {
        hasCompleted: false,
        currentStreak: 0,
        longestStreak: 0,
        history: [],
        todayChallenge: FALLBACK_CHALLENGES[challengeType],
      },
    });
  }

  const streak = await findOrCreateStreak(req.user._id);

  const hasCompleted =
    streak.lastCompletedDate &&
    toDateString(streak.lastCompletedDate) === todayStr;

  // 👇 Wrap Groq call in try/catch — never crash on AI failure
  let challenge;
  try {
    const prompt = `Generate one ${challengeType} challenge question for interview prep.
Return ONLY JSON: { "question": "...", "type": "${challengeType}" }`;

    challenge = await generateContent(prompt, true);

    // Validate response has required fields
    if (!challenge?.question) {
      throw new Error('Invalid AI response');
    }
  } catch (aiError) {
    // Rate limit (429) or any other AI error → use fallback silently
    console.warn(`Groq unavailable (${aiError.status || aiError.message}), using fallback challenge`);
    challenge = FALLBACK_CHALLENGES[challengeType];
  }

  res.status(200).json({
    success: true,
    data: {
      hasCompleted,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      history: streak.history || [],
      todayChallenge: {
        type: challenge.type || challengeType,
        question: challenge.question,
      },
    },
  });
});

export const completeChallenge = asyncHandler(async (req, res) => {
  const { challengeType, score } = req.body;

  if (!challengeType) {
    return res.status(400).json({
      success: false,
      message: 'challengeType is required',
    });
  }

  // 👇 Guest users can't save progress
  if (req.user?.role === 'guest') {
    return res.status(403).json({
      success: false,
      message: 'Register to save your streak progress.',
    });
  }

  const streak = await findOrCreateStreak(req.user._id);
  const todayStr = toDateString(new Date());
  const lastStr = streak.lastCompletedDate
    ? toDateString(streak.lastCompletedDate)
    : null;

  if (lastStr === todayStr) {
    return res.status(200).json({
      success: true,
      data: streak,
    });
  }

  const yesterdayStr = getYesterdayString(todayStr);

  if (lastStr === yesterdayStr) {
    streak.currentStreak += 1;
  } else {
    streak.currentStreak = 1;
  }

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  streak.lastCompletedDate = new Date();
  streak.history.push({
    date: new Date(),
    type: challengeType,
    score: score !== undefined ? Number(score) : undefined,
  });

  await streak.save();

  res.status(200).json({
    success: true,
    data: streak,
  });
});