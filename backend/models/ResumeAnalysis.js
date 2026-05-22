import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeNoteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    keywords: {
      found: [String],
      missing: [String],
    },
    skills: {
      technical: [String],
      soft: [String],
    },
    improvements: [
      {
        title: String,
        description: String,
        priority: {
          type: String,
          enum: ['high', 'medium', 'low'],
        },
      },
    ],
    strengths: [String],
    weaknesses: [String],
    detectedSkills: [String],
    missingKeywords: [String],
    improvementSuggestions: [String],
    overallFeedback: String,
    recommendedKeywords: [String],
    formattingSuggestions: [String],
    scoringBreakdown: {
      content: Number,
      formatting: Number,
      keywords: Number,
      structure: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
