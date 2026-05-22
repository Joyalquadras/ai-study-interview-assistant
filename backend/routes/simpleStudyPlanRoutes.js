import express from 'express';
import { generatePlan, getMyPlans } from '../controllers/studyPlanController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generatePlan);
router.get('/my-plans', getMyPlans);

export default router;
