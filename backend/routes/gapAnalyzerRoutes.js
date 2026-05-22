// backend/routes/gapAnalyzerRoutes.js
import express from 'express';
import { analyzeGap, getHistory } from '../controllers/gapAnalyzerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, analyzeGap);
router.get('/history', protect, getHistory);

export default router;
