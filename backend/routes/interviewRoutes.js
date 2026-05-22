import express from 'express';
import {
  getMockInterviews,
  getMockInterview,
  startMockInterview,
  submitResponse,
  completeMockInterview,
  deleteMockInterview,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getMockInterviews);
router.post('/start', startMockInterview);
router.get('/:id', getMockInterview);
router.post('/:id/submit-response/:questionId', submitResponse);
router.put('/:id/complete', completeMockInterview);
router.delete('/:id', deleteMockInterview);

export default router;
