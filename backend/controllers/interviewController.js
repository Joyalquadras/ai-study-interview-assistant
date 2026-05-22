import MockInterview from '../models/MockInterview.js';
import {
  generateInterviewQuestions,
  evaluateInterviewResponse,
} from '../services/geminiService.js';
import asyncHandler from '../middleware/asyncHandler.js';

const DIFFICULTY_MAP = {
  easy: 'beginner',
  medium: 'intermediate',
  hard: 'advanced',
};

const normalizeScoreOutOf10 = (score) => {
  const n = Number(score);
  if (Number.isNaN(n)) return 0;
  if (n > 10) return Math.round(n / 10);
  return Math.round(n * 10) / 10;
};

// POST /api/interview/start
export const startInterview = asyncHandler(async (req, res) => {
  const { category, difficulty } = req.body;

  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Category is required',
    });
  }

  const mappedDifficulty =
    DIFFICULTY_MAP[difficulty] || difficulty || 'intermediate';

  let questions;
  try {
    questions = await generateInterviewQuestions(
      category,
      mappedDifficulty,
      5
    );
  } catch (err) {
    return res.status(502).json({
      success: false,
      message:
        'AI service error: ' +
        (err.message || 'Failed to generate questions'),
    });
  }

  const interview = await MockInterview.create({
    userId: req.userId,
    title: `${category} Mock Interview`,
    category,
    difficulty: mappedDifficulty,
    duration: 30,
    questionsCount: questions.length,
    questions,
    status: 'in-progress',
    timeStarted: new Date(),
  });

  res.status(201).json({
    success: true,
    data: { interview },
  });
});

// POST /api/interview/respond
export const respondInterview = asyncHandler(async (req, res) => {
  const { interviewId, answer } = req.body;

  if (!interviewId || !answer?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'interviewId and answer are required',
    });
  }

  const interview = await MockInterview.findById(interviewId);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Mock interview not found',
    });
  }

  if (interview.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this interview',
    });
  }

  const questionIndex = interview.responses.length;

  if (questionIndex >= interview.questions.length) {
    return res.status(400).json({
      success: false,
      message: 'All questions have been answered',
    });
  }

  const question = interview.questions[questionIndex];

  let evaluation;
  try {
    evaluation = await evaluateInterviewResponse(
      question.question,
      answer.trim(),
      interview.category
    );
  } catch (err) {
    return res.status(502).json({
      success: false,
      message:
        'AI service error: ' +
        (err.message || 'Failed to evaluate response'),
    });
  }

  const normalizedScore = normalizeScoreOutOf10(evaluation.score);

  interview.responses.push({
    questionId: question.id || `q-${questionIndex}`,
    question: question.question,
    category: interview.category,
    userResponse: answer.trim(),
    aiEvaluation: {
      score: normalizedScore,
      feedback: evaluation.feedback || evaluation.comments || '',
      strengths: evaluation.strengths || [],
      areasForImprovement:
        evaluation.areasForImprovement || evaluation.improvements || [],
    },
  });

  await interview.save();

  const isComplete =
    interview.responses.length >= interview.questions.length;

  res.status(200).json({
    success: true,
    data: {
      evaluation: {
        score: normalizedScore,
        feedback:
          evaluation.feedback ||
          evaluation.comments ||
          'No feedback provided',
        strengths: evaluation.strengths || [],
        areasForImprovement:
          evaluation.areasForImprovement || evaluation.improvements || [],
      },
      isComplete,
      currentQuestion: interview.responses.length,
      totalQuestions: interview.questions.length,
    },
  });
});

// POST /api/interview/end
export const endInterview = asyncHandler(async (req, res) => {
  const { interviewId } = req.body;

  if (!interviewId) {
    return res.status(400).json({
      success: false,
      message: 'interviewId is required',
    });
  }

  const interview = await MockInterview.findById(interviewId);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Mock interview not found',
    });
  }

  if (interview.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this interview',
    });
  }

  const scores = interview.responses
    .map((r) => normalizeScoreOutOf10(r.aiEvaluation?.score))
    .filter((s) => s > 0);

  if (scores.length > 0) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    interview.overallScore = Math.round(avg * 10) / 10;
  }

  const strengths = [
    ...new Set(
      interview.responses.flatMap((r) => r.aiEvaluation?.strengths || [])
    ),
  ].filter(Boolean);

  const improvements = [
    ...new Set(
      interview.responses.flatMap(
        (r) => r.aiEvaluation?.areasForImprovement || []
      )
    ),
  ].filter(Boolean);

  interview.strengths = strengths.length
    ? strengths
    : ['Good effort completing the interview'];
  interview.improvements = improvements.length
    ? improvements
    : ['Practice structuring answers with specific examples'];

  if (interview.timeStarted) {
    interview.totalTime = Math.floor(
      (Date.now() - new Date(interview.timeStarted).getTime()) / 1000
    );
  }

  interview.status = 'completed';
  interview.timeCompleted = new Date();

  await interview.save();

  res.status(200).json({
    success: true,
    data: { interview },
  });
});

// Get all mock interviews for user
export const getMockInterviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let query = { userId: req.userId };
  const { category, status } = req.query;

  if (category) {
    query.category = category;
  }

  if (status) {
    query.status = status;
  }

  const interviews = await MockInterview.find(query)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await MockInterview.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      interviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    },
  });
});

// Get single mock interview
export const getMockInterview = asyncHandler(async (req, res) => {
  const interview = await MockInterview.findById(req.params.id);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Mock interview not found',
    });
  }

  if (interview.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this interview',
    });
  }

  res.status(200).json({
    success: true,
    data: { interview },
  });
});

// Start new mock interview
export const startMockInterview = asyncHandler(async (req, res) => {
  const { title, category, difficulty, duration, questionsCount } = req.body;

  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Category is required',
    });
  }

  let questions;
  try {
    questions = await generateInterviewQuestions(
      category,
      difficulty,
      questionsCount || 5
    );
  } catch (err) {
    return res.status(502).json({
      success: false,
      message: 'AI service error: ' + (err.message || 'Failed to generate questions'),
    });
  }

  const interview = await MockInterview.create({
    userId: req.userId,
    title: title || `${category} Interview`,
    category,
    difficulty: difficulty || 'intermediate',
    duration: duration || 30,
    questionsCount: questions.length,
    questions,
    status: 'in-progress',
    timeStarted: new Date(),
  });

  res.status(201).json({
    success: true,
    message: 'Mock interview started',
    data: { interview },
  });
});

// Submit interview response
export const submitResponse = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { userResponse, timeSpent } = req.body;

  const interview = await MockInterview.findById(req.params.id);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Mock interview not found',
    });
  }

  if (interview.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this interview',
    });
  }

  const question = interview.questions.find((q) => q.id === questionId);

  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found',
    });
  }

  let evaluation;
  try {
    evaluation = await evaluateInterviewResponse(
      question.question,
      userResponse,
      interview.category
    );
  } catch (err) {
    return res.status(502).json({
      success: false,
      message: 'AI service error: ' + (err.message || 'Failed to evaluate response'),
    });
  }

  interview.responses.push({
    questionId,
    question: question.question,
    category: interview.category,
    userResponse,
    aiEvaluation: evaluation,
    timeSpent,
  });

  await interview.save();

  res.status(200).json({
    success: true,
    message: 'Response submitted and evaluated',
    data: {
      interview,
      evaluation,
    },
  });
});

// Complete interview
export const completeMockInterview = asyncHandler(async (req, res) => {
  const interview = await MockInterview.findById(req.params.id);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Mock interview not found',
    });
  }

  if (interview.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this interview',
    });
  }

  if (interview.responses.length > 0) {
    const scores = interview.responses
      .map((r) => Number(r.aiEvaluation?.score))
      .filter((s) => !Number.isNaN(s));
    if (scores.length > 0) {
      interview.overallScore =
        Math.round((scores.reduce((a, b) => a + b) / scores.length) * 10) / 10;
    } else {
      interview.overallScore = null;
    }

    interview.totalTime = new Date() - new Date(interview.timeStarted);
  }

  interview.status = 'completed';
  interview.timeCompleted = new Date();

  await interview.save();

  res.status(200).json({
    success: true,
    message: 'Mock interview completed',
    data: { interview },
  });
});

// Delete mock interview
export const deleteMockInterview = asyncHandler(async (req, res) => {
  const interview = await MockInterview.findById(req.params.id);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Mock interview not found',
    });
  }

  if (interview.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this interview',
    });
  }

  await MockInterview.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Mock interview deleted successfully',
  });
});
