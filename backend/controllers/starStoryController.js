// backend/controllers/starStoryController.js
import StarStory from '../models/StarStory.js';
import { generateContent } from '../services/geminiService.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const createStory = asyncHandler(async (req, res) => {
  const { situation, task, action, result, tags } = req.body;

  if (!situation || !task || !action || !result) {
    return res.status(400).json({
      success: false,
      message: 'situation, task, action, and result are required',
    });
  }

  const prompt = `Given this STAR story, list the HR interview questions it best answers.
Situation: ${situation}
Task: ${task}
Action: ${action}
Result: ${result}
Return ONLY a JSON array of question strings. Max 5 questions.`;

  const parsed = await generateContent(prompt, true);
  const mappedQuestions = Array.isArray(parsed)
    ? parsed.slice(0, 5)
    : parsed?.questions || parsed?.mappedQuestions || [];

  const savedStory = await StarStory.create({
    userId: req.user._id,
    situation,
    task,
    action,
    result,
    tags: tags || [],
    mappedQuestions,
  });

  res.status(201).json({
    success: true,
    data: savedStory,
  });
});

export const getStories = asyncHandler(async (req, res) => {
  const stories = await StarStory.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    data: stories,
  });
});

export const deleteStory = asyncHandler(async (req, res) => {
  const story = await StarStory.findById(req.params.id);

  if (!story) {
    return res.status(404).json({
      success: false,
      message: 'Story not found',
    });
  }

  if (story.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this story',
    });
  }

  await story.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Story deleted',
  });
});
