import express from 'express';
import { getChatHistory, postChatMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/history', getChatHistory);
router.post('/message', postChatMessage);

export default router;
