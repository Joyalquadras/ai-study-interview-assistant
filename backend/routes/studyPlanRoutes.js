import express from 'express';
import {
  getStudyPlans,
  getStudyPlan,
  createStudyPlan,
  updateStudyPlan,
  updateTask,
  deleteStudyPlan,
} from '../controllers/studyPlanController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getStudyPlans);
router.post('/', createStudyPlan);
router.get('/:id', getStudyPlan);
router.put('/:id', updateStudyPlan);
router.put('/:id/task/:taskIndex', updateTask);
router.delete('/:id', deleteStudyPlan);

export default router;
