// backend/routes/streakRoutes.js
import express from 'express';
import { getToday, completeChallenge } from '../controllers/streakController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/today', protect, getToday);
router.post('/complete', protect, completeChallenge);

export default router;
