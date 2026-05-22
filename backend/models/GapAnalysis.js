// backend/models/GapAnalysis.js
import mongoose from 'mongoose';

const gapAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  matchScore: {
    type: Number,
  },
  matchedSkills: {
    type: [String],
    default: [],
  },
  missingSkills: {
    type: [String],
    default: [],
  },
  priorityTopics: {
    type: [String],
    default: [],
  },
  recommendation: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('GapAnalysis', gapAnalysisSchema);
