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
  // 0 = Sun, 1 = Mon, ... 6 = Sat
  if (dayOfWeek === 0) return 'summary';
  if (dayOfWeek === 1 || dayOfWeek === 4) return 'mcq';
  if (dayOfWeek === 2 || dayOfWeek === 5) return 'flashcard';
  return 'mock_question'; // Wed, Sat
};

const findOrCreateStreak = async (userId) => {
  let streak = await Streak.findOne({ userId });
  if (!streak) {
    streak = await Streak.create({ userId });
  }
  return streak;
};

export const getToday = asyncHandler(async (req, res) => {
  const streak = await findOrCreateStreak(req.user._id);
  const todayStr = toDateString(new Date());
  const challengeType = getChallengeTypeForDay(new Date().getDay());

  const hasCompleted =
    streak.lastCompletedDate &&
    toDateString(streak.lastCompletedDate) === todayStr;

  const prompt = `Generate one ${challengeType} challenge question for interview prep.
Return ONLY JSON: { "question": "...", "type": "${challengeType}" }`;

  const challenge = await generateContent(prompt, true);

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
