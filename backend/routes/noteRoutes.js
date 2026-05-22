import express from 'express';
import {
  getNotes,
  getNote,
  uploadNote,
  updateNote,
  deleteNote,
  generateContent,
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getNotes);
router.get('/:id', getNote);
router.post('/generate-content', generateContent);
router.post('/upload', upload.single('file'), uploadNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
