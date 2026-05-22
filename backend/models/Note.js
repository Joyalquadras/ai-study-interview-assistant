import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: String,
    filePath: {
      type: String,
      required: true,
    },
    fileName: String,
    fileSize: Number,
    fileType: {
      type: String,
      enum: ['pdf', 'txt', 'markdown'],
    },
    content: {
      type: String,
      // Extracted text from PDF/file
    },
    category: {
      type: String,
      enum: ['resume', 'notes', 'study-material', 'interview-prep', 'other'],
      default: 'notes',
    },
    tags: [String],
    isPublic: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for faster queries
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ category: 1 });

export default mongoose.model('Note', noteSchema);
