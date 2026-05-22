import express from 'express';
import {
  analyzeResumePost,
  analyzeResumeFile,
  getResumeAnalysis,
  getResumeAnalyses,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/analyze', analyzeResumePost);
router.post('/:noteId/analyze', analyzeResumeFile);
router.get('/:noteId', getResumeAnalysis);
router.get('/', getResumeAnalyses);

export default router;
