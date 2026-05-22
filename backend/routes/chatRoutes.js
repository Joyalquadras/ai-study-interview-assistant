import express from 'express';
import {
  getChats,
  getChat,
  createChat,
  sendMessage,
  deleteChat,
  togglePinChat,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getChats);
router.post('/', createChat);
router.get('/:chatId', getChat);
router.post('/:chatId/message', sendMessage);
router.delete('/:chatId', deleteChat);
router.put('/:chatId/toggle-pin', togglePinChat);

export default router;
