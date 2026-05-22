import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Chat',
    },
    noteIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
      },
    ],
    context: String, // Context provided from notes
    messages: [messageSchema],
    category: {
      type: String,
      enum: ['general', 'notes-based', 'interview-prep', 'resume-review'],
      default: 'general',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    modelUsed: {
      type: String,
      default: 'gemini-pro',
    },
  },
  { timestamps: true }
);

// Index for faster queries
chatSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Chat', chatSchema);
