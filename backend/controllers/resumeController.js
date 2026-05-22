import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Note from '../models/Note.js';
import { analyzeResume } from '../services/geminiService.js';
import asyncHandler from '../middleware/asyncHandler.js';

const runResumeAnalysis = async (noteId, userId) => {
  const note = await Note.findById(noteId);

  if (!note) {
    const err = new Error('Resume not found');
    err.statusCode = 404;
    throw err;
  }

  if (note.userId.toString() !== userId) {
    const err = new Error('Not authorized to analyze this resume');
    err.statusCode = 403;
    throw err;
  }

  let analysisResult;
  try {
    analysisResult = await analyzeResume(note.content);
  } catch (err) {
    const error = new Error(
      'AI service error: ' + (err.message || 'Failed to analyze resume')
    );
    error.statusCode = 502;
    throw error;
  }

  const detectedSkills = [
    ...(analysisResult.detectedSkills || []),
    ...(analysisResult.skills?.technical || []),
    ...(analysisResult.skills?.soft || []),
  ];

  const normalized = {
    ...analysisResult,
    detectedSkills: [...new Set(detectedSkills)],
    missingKeywords:
      analysisResult.missingKeywords ||
      analysisResult.keywords?.missing ||
      analysisResult.recommendedKeywords ||
      [],
    weaknesses:
      analysisResult.weaknesses ||
      analysisResult.areasForImprovement ||
      [],
    improvementSuggestions:
      analysisResult.improvementSuggestions ||
      (analysisResult.improvements || []).map((item) =>
        typeof item === 'string' ? item : item.description || item.title
      ),
  };

  let analysis = await ResumeAnalysis.findOne({ resumeNoteId: noteId });

  if (!analysis) {
    analysis = await ResumeAnalysis.create({
      userId,
      resumeNoteId: noteId,
      ...normalized,
    });
  } else {
    analysis = await ResumeAnalysis.findByIdAndUpdate(
      analysis._id,
      normalized,
      { new: true }
    );
  }

  return analysis;
};

// POST /api/resume/analyze { noteId }
export const analyzeResumePost = asyncHandler(async (req, res) => {
  const { noteId } = req.body;

  if (!noteId) {
    return res.status(400).json({
      success: false,
      message: 'noteId is required',
    });
  }

  const analysis = await runResumeAnalysis(noteId, req.userId);

  res.status(200).json({
    success: true,
    data: { analysis },
  });
});

// Analyze resume
export const analyzeResumeFile = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const analysis = await runResumeAnalysis(noteId, req.userId);

  res.status(200).json({
    success: true,
    data: { analysis },
  });
});

// Get resume analysis
export const getResumeAnalysis = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  const analysis = await ResumeAnalysis.findOne({
    resumeNoteId: noteId,
    userId: req.userId,
  });

  if (!analysis) {
    return res.status(404).json({
      success: false,
      message: 'Analysis not found. Please analyze the resume first.',
    });
  }

  res.status(200).json({
    success: true,
    data: { analysis },
  });
});

// Get all resume analyses for user
export const getResumeAnalyses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const analyses = await ResumeAnalysis.find({ userId: req.userId })
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 })
    .populate('resumeNoteId', 'title fileName');

  const total = await ResumeAnalysis.countDocuments({ userId: req.userId });

  res.status(200).json({
    success: true,
    data: {
      analyses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    },
  });
});
