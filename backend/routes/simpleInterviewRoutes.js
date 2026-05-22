import express from 'express';
import {
  startInterview,
  respondInterview,
  endInterview,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/start', startInterview);
router.post('/respond', respondInterview);
router.post('/end', endInterview);

export default router;
