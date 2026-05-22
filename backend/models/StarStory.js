// backend/models/StarStory.js
import mongoose from 'mongoose';

const starStorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  situation: {
    type: String,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  result: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  mappedQuestions: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('StarStory', starStorySchema);
