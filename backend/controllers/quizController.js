// backend/controllers/quizController.js
import QuizAttempt from '../models/QuizAttempt.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const submitAnswer = asyncHandler(async (req, res) => {
  const {
    questionId,
    selectedAnswer,
    correctAnswer,
    confidence,
    noteId,
  } = req.body;

  if (confidence === undefined || confidence === null) {
    return res.status(400).json({
      success: false,
      message: 'Confidence is required (1-5)',
    });
  }

  const confidenceNum = Number(confidence);

  if (
    !Number.isInteger(confidenceNum) ||
    confidenceNum < 1 ||
    confidenceNum > 5
  ) {
    return res.status(400).json({
      success: false,
      message: 'Confidence must be an integer between 1 and 5',
    });
  }

  const isCorrect = selectedAnswer === correctAnswer;

  await QuizAttempt.create({
    userId: req.user._id,
    noteId: noteId || undefined,
    questionId,
    selectedAnswer,
    correctAnswer,
    isCorrect,
    confidence: confidenceNum,
  });

  const message = isCorrect
    ? 'Correct answer!'
    : 'Incorrect answer. Review this topic.';

  res.status(201).json({
    success: true,
    data: { isCorrect, message },
  });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [stats, confidenceBreakdown] = await Promise.all([
    QuizAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          highConfidenceWrong: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$confidence', 4] },
                    { $eq: ['$isCorrect', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          lowConfidenceRight: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lte: ['$confidence', 2] },
                    { $eq: ['$isCorrect', true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    QuizAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$confidence',
          correct: {
            $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const summary = stats[0] || {
    totalAttempts: 0,
    highConfidenceWrong: 0,
    lowConfidenceRight: 0,
  };

  const confidenceMap = Object.fromEntries(
    confidenceBreakdown.map((row) => [row._id, row])
  );

  const accuracyByConfidence = [1, 2, 3, 4, 5].map((level) => {
    const row = confidenceMap[level];
    const correct = row?.correct || 0;
    const total = row?.total || 0;
    return {
      confidence: level,
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  });

  res.status(200).json({
    success: true,
    data: {
      totalAttempts: summary.totalAttempts,
      highConfidenceWrong: summary.highConfidenceWrong,
      lowConfidenceRight: summary.lowConfidenceRight,
      accuracyByConfidence,
    },
  });
});
