import StudyPlan from '../models/StudyPlan.js';
import {
  generateStudyPlan,
  generateDetailedStudyPlan,
} from '../services/geminiService.js';
import asyncHandler from '../middleware/asyncHandler.js';

const normalizeScheduleDays = (days) => {
  if (!Array.isArray(days)) return [];

  return days.map((day, index) => ({
    dayNumber: day.dayNumber ?? index + 1,
    date: day.date ? new Date(day.date) : new Date(),
    tasks: (day.tasks || []).map((task) => ({
      topic: task.topic || 'General',
      duration: task.duration || '',
      description: task.description || '',
      resources: Array.isArray(task.resources)
        ? task.resources.filter(Boolean)
        : [],
    })),
  }));
};

// POST /api/study-plan/generate
export const generatePlan = asyncHandler(async (req, res) => {
  const { goal, topics, hoursPerDay, targetDate } = req.body;

  if (!goal?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Goal is required',
    });
  }

  if (!Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one topic is required',
    });
  }

  const hours = parseInt(hoursPerDay, 10);
  if (Number.isNaN(hours) || hours < 1 || hours > 12) {
    return res.status(400).json({
      success: false,
      message: 'Hours per day must be between 1 and 12',
    });
  }

  if (!targetDate) {
    return res.status(400).json({
      success: false,
      message: 'Target date is required',
    });
  }

  const target = new Date(targetDate);
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (target < tomorrow) {
    return res.status(400).json({
      success: false,
      message: 'Target date must be tomorrow or later',
    });
  }

  let aiGeneratedPlan;
  try {
    aiGeneratedPlan = await generateDetailedStudyPlan(
      goal.trim(),
      topics,
      hours,
      targetDate
    );
  } catch (err) {
    return res.status(502).json({
      success: false,
      message:
        'AI service error: ' +
        (err.message || 'Failed to generate study plan'),
    });
  }

  const schedule = normalizeScheduleDays(aiGeneratedPlan.days);

  const plan = await StudyPlan.create({
    userId: req.userId,
    title: goal.trim().slice(0, 100),
    goal: goal.trim(),
    topics,
    hoursPerDay: hours,
    endDate: target,
    schedule,
    tasks: [],
    aiGenerated: true,
    category: 'interview-prep',
  });

  res.status(201).json({
    success: true,
    data: { plan },
  });
});

// GET /api/study-plan/my-plans
export const getMyPlans = asyncHandler(async (req, res) => {
  const plans = await StudyPlan.find({ userId: req.userId })
    .select('goal createdAt schedule')
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    data: { plans },
  });
});

// Get all study plans for user
export const getStudyPlans = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  let query = { userId: req.userId };
  const { isActive } = req.query;
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const plans = await StudyPlan.find(query)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await StudyPlan.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      plans,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    },
  });
});

// Get single study plan
export const getStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findById(req.params.id);

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Study plan not found',
    });
  }

  if (plan.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this plan',
    });
  }

  res.status(200).json({
    success: true,
    data: { plan },
  });
});

// Create study plan
export const createStudyPlan = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    goal,
    category,
    duration,
    difficulty,
    generateAI,
  } = req.body;

  if (!title || !goal) {
    return res.status(400).json({
      success: false,
      message: 'Title and goal are required',
    });
  }

  let plan;

  if (generateAI) {
    let aiGeneratedPlan;
    try {
      aiGeneratedPlan = await generateStudyPlan(
        goal,
        category,
        difficulty,
        duration
      );
    } catch (err) {
      return res.status(502).json({
        success: false,
        message: 'AI service error: ' + (err.message || 'Failed to generate study plan'),
      });
    }

    plan = await StudyPlan.create({
      userId: req.userId,
      title,
      description,
      goal,
      category,
      duration,
      difficulty,
      tasks: Array.isArray(aiGeneratedPlan.tasks) ? aiGeneratedPlan.tasks : [],
      aiGenerated: true,
    });
  } else {
    plan = await StudyPlan.create({
      userId: req.userId,
      title,
      description,
      goal,
      category,
      duration,
      difficulty,
      tasks: [],
      aiGenerated: false,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Study plan created successfully',
    data: { plan },
  });
});

// Update study plan
export const updateStudyPlan = asyncHandler(async (req, res) => {
  let plan = await StudyPlan.findById(req.params.id);

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Study plan not found',
    });
  }

  if (plan.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this plan',
    });
  }

  const { title, description, tasks, progress, isActive, endDate } = req.body;

  plan = await StudyPlan.findByIdAndUpdate(
    req.params.id,
    {
      title: title || plan.title,
      description: description || plan.description,
      tasks: tasks || plan.tasks,
      progress: progress || plan.progress,
      isActive: isActive !== undefined ? isActive : plan.isActive,
      endDate: endDate || plan.endDate,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Study plan updated successfully',
    data: { plan },
  });
});

// Update task
export const updateTask = asyncHandler(async (req, res) => {
  const { taskIndex } = req.params;
  const { title, description, dueDate, priority, isCompleted } = req.body;

  let plan = await StudyPlan.findById(req.params.id);

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Study plan not found',
    });
  }

  if (plan.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this plan',
    });
  }

  const idx = parseInt(taskIndex, 10);
  if (Number.isNaN(idx) || idx < 0 || idx >= plan.tasks.length) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task index',
    });
  }

  if (title) plan.tasks[taskIndex].title = title;
  if (description) plan.tasks[taskIndex].description = description;
  if (dueDate) plan.tasks[taskIndex].dueDate = dueDate;
  if (priority) plan.tasks[taskIndex].priority = priority;
  if (isCompleted !== undefined) {
    plan.tasks[taskIndex].isCompleted = isCompleted;
    if (isCompleted) {
      plan.tasks[taskIndex].completedDate = new Date();
    }
  }

  const completedTasks = plan.tasks.filter((t) => t.isCompleted).length;
  plan.progress =
    plan.tasks.length > 0
      ? Math.round((completedTasks / plan.tasks.length) * 100)
      : 0;

  await plan.save();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: { plan },
  });
});

// Delete study plan
export const deleteStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findById(req.params.id);

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: 'Study plan not found',
    });
  }

  if (plan.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this plan',
    });
  }

  await StudyPlan.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Study plan deleted successfully',
  });
});
