import mongoose from 'mongoose';

const questionResponseSchema = new mongoose.Schema({
  questionId: String,
  question: String,
  category: String,
  userResponse: String,
  aiEvaluation: {
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: String,
    strengths: [String],
    areasForImprovement: [String],
  },
  timeSpent: Number, // in seconds
});

const mockInterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'hr-questions',
        'javascript',
        'react',
        'nodejs',
        'mongodb',
        'dsa',
        'blockchain',
      ],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    duration: Number, // in minutes
    questionsCount: Number,
    questions: [
      {
        id: String,
        question: String,
        difficulty: String,
      },
    ],
    responses: [questionResponseSchema],
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    overallFeedback: String,
    strengths: [String],
    improvements: [String],
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'paused'],
      default: 'in-progress',
    },
    timeStarted: Date,
    timeCompleted: Date,
    totalTime: Number, // in seconds
  },
  { timestamps: true }
);

// Index for faster queries
mockInterviewSchema.index({ userId: 1, createdAt: -1 });
mockInterviewSchema.index({ category: 1 });

export default mongoose.model('MockInterview', mockInterviewSchema);
