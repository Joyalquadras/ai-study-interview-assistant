// backend/routes/starStoryRoutes.js
import express from 'express';
import {
  createStory,
  getStories,
  deleteStory,
} from '../controllers/starStoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createStory);
router.get('/', protect, getStories);
router.delete('/:id', protect, deleteStory);

export default router;
