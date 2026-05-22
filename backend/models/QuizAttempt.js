// backend/models/QuizAttempt.js
import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
  },
  questionId: {
    type: String,
  },
  selectedAnswer: {
    type: String,
  },
  correctAnswer: {
    type: String,
  },
  isCorrect: {
    type: Boolean,
  },
  confidence: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('QuizAttempt', quizAttemptSchema);
