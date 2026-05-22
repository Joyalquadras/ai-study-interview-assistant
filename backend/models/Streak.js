// backend/models/Streak.js
import mongoose from 'mongoose';

const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastCompletedDate: {
    type: Date,
  },
  history: [
    {
      date: {
        type: Date,
      },
      type: {
        type: String,
      },
      score: {
        type: Number,
      },
    },
  ],
});

export default mongoose.model('Streak', streakSchema);
