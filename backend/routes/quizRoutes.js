// backend/routes/quizRoutes.js
import express from 'express';
import { submitAnswer, getAnalytics } from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit-answer', protect, submitAnswer);
router.get('/analytics', protect, getAnalytics);

export default router;
