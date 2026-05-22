import Note from '../models/Note.js';
import pdf from 'pdf-parse';
import fs from 'fs';
import {
  generateSummary,
  generateQuestions,
  generateMCQs,
  generateFlashcards,
  generateNoteInterviewQuestions,
} from '../services/geminiService.js';
import asyncHandler from '../middleware/asyncHandler.js';

// Get all notes for user
export const getNotes = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10, search } = req.query;

  let query = { userId: req.userId };

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const notes = await Note.find(query)
    .limit(limit * 1)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await Note.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      notes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    },
  });
});

// Get single note
export const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found',
    });
  }

  if (note.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this note',
    });
  }

  note.views += 1;
  await note.save();

  const noteData = note.toObject();
  const content = note.content || '';
  noteData.parsedContentPreview = content.slice(0, 200);
  noteData.uploadedAt = note.createdAt;

  res.status(200).json({
    success: true,
    data: { note: noteData },
  });
});

// Upload note (PDF/TXT)
export const uploadNote = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  try {
    const { title, description, category, tags } = req.body;

    let content = '';
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdf(dataBuffer);
      content = pdfData.text;
    } else if (req.file.mimetype === 'text/plain') {
      content = fs.readFileSync(req.file.path, 'utf-8');
    }

    const note = await Note.create({
      userId: req.userId,
      title: title || req.file.originalname,
      description,
      filePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      fileType: req.file.mimetype.includes('pdf') ? 'pdf' : 'txt',
      content,
      category: category || 'notes',
      tags: tags ? JSON.parse(tags) : [],
    });

    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      data: { note },
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw error;
  }
});

// Update note
export const updateNote = asyncHandler(async (req, res) => {
  let note = await Note.findById(req.params.id);

  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found',
    });
  }

  if (note.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this note',
    });
  }

  const { title, description, category, tags, isPublic } = req.body;

  note = await Note.findByIdAndUpdate(
    req.params.id,
    {
      title: title || note.title,
      description: description || note.description,
      category: category || note.category,
      tags: tags || note.tags,
      isPublic: isPublic !== undefined ? isPublic : note.isPublic,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Note updated successfully',
    data: { note },
  });
});

// Delete note
export const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found',
    });
  }

  if (note.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this note',
    });
  }

  if (fs.existsSync(note.filePath)) {
    fs.unlinkSync(note.filePath);
  }

  await Note.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Note deleted successfully',
  });
});

// Generate content from note using AI
export const generateContent = asyncHandler(async (req, res) => {
  const { noteId, type } = req.body;

  if (!noteId || !type) {
    return res.status(400).json({
      success: false,
      message: 'noteId and type are required',
    });
  }

  const note = await Note.findById(noteId);

  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  if (note.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this note',
    });
  }

  const content = note.content || note.parsedContent || '';

  try {
    switch (type) {
      case 'summary': {
        const result = await generateSummary(content);
        return res.status(200).json({ success: true, data: { summary: result } });
      }
      case 'questions': {
        const result = await generateQuestions(content, 10);
        return res.status(200).json({ success: true, data: { questions: result } });
      }
      case 'mcqs': {
        const result = await generateMCQs(content, 10);
        return res.status(200).json({ success: true, data: { mcqs: result } });
      }
      case 'flashcards': {
        const result = await generateFlashcards(content, 20);
        return res.status(200).json({ success: true, data: { flashcards: result } });
      }
      case 'interview-questions': {
        const result = await generateNoteInterviewQuestions(content, 10);
        return res
          .status(200)
          .json({ success: true, data: { interviewQuestions: result } });
      }
      default:
        return res.status(400).json({ success: false, message: 'Invalid type' });
    }
  } catch (err) {
    return res.status(502).json({
      success: false,
      message: 'AI service error: ' + (err.message || 'Failed to generate content'),
    });
  }
});
