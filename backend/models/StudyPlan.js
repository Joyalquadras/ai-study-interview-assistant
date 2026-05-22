import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  dueDate: Date,
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedDate: Date,
  resources: [String],
});

const scheduleTaskSchema = new mongoose.Schema({
  topic: String,
  duration: String,
  description: String,
  resources: [String],
});

const scheduleDaySchema = new mongoose.Schema({
  dayNumber: Number,
  date: Date,
  tasks: [scheduleTaskSchema],
});

const studyPlanSchema = new mongoose.Schema(
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
    description: String,
    goal: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'interview-prep',
        'exam-prep',
        'skill-learning',
        'project-development',
        'other',
      ],
      default: 'interview-prep',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
      },
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    tasks: [taskSchema],
    topics: [String],
    hoursPerDay: {
      type: Number,
      min: 1,
      max: 12,
    },
    schedule: [scheduleDaySchema],
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    aiGenerated: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
studyPlanSchema.index({ userId: 1, isActive: 1, createdAt: -1 });

export default mongoose.model('StudyPlan', studyPlanSchema);
