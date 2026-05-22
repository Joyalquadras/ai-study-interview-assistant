import Chat from '../models/Chat.js';
import Note from '../models/Note.js';
import { getGeminiResponse } from '../services/geminiService.js';
import asyncHandler from '../middleware/asyncHandler.js';

const getOrCreateGeneralChat = async (userId) => {
  let chat = await Chat.findOne({
    userId,
    category: 'general',
    $or: [{ noteIds: { $size: 0 } }, { noteIds: { $exists: false } }],
  }).sort({ updatedAt: -1 });

  if (!chat) {
    chat = await Chat.create({
      userId,
      title: 'General Chat',
      category: 'general',
      noteIds: [],
      messages: [],
    });
  }

  return chat;
};

// GET /api/chat/history — general conversation messages
export const getChatHistory = asyncHandler(async (req, res) => {
  const chat = await getOrCreateGeneralChat(req.userId);

  res.status(200).json({
    success: true,
    data: { messages: chat.messages },
  });
});

// POST /api/chat/message — send message with optional note context
export const postChatMessage = asyncHandler(async (req, res) => {
  const { message, noteId } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Message is required',
    });
  }

  const chat = await getOrCreateGeneralChat(req.userId);

  let context = chat.context || '';
  if (noteId) {
    const note = await Note.findOne({ _id: noteId, userId: req.userId });
    if (note) {
      context = `## ${note.title}\n${note.content}`;
    }
  }

  chat.messages.push({
    role: 'user',
    content: message.trim(),
    timestamp: new Date(),
  });

  let aiResponse;
  try {
    aiResponse = await getGeminiResponse(message.trim(), context);
  } catch (err) {
    chat.messages.pop();
    await chat.save();
    return res.status(502).json({
      success: false,
      message:
        'AI service error: ' + (err.message || 'Failed to get AI response'),
    });
  }

  const assistantMessage = {
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date(),
  };

  chat.messages.push(assistantMessage);
  await chat.save();

  res.status(200).json({
    success: true,
    data: { message: assistantMessage },
  });
});

// Get all chats for user
export const getChats = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const chats = await Chat.find({ userId: req.userId })
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 })
    .select('title category isPinned createdAt');

  const total = await Chat.countDocuments({ userId: req.userId });

  res.status(200).json({
    success: true,
    data: {
      chats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    },
  });
});

// Get single chat with messages
export const getChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found',
    });
  }

  if (chat.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this chat',
    });
  }

  res.status(200).json({
    success: true,
    data: { chat },
  });
});

// Create new chat
export const createChat = asyncHandler(async (req, res) => {
  const { title, noteIds, category } = req.body;

  let context = '';
  if (noteIds && noteIds.length > 0) {
    const notes = await Note.find({
      _id: { $in: noteIds },
      userId: req.userId,
    });

    context = notes
      .map(
        (note) => `
## ${note.title}
${note.content}
`
      )
      .join('\n\n');
  }

  const chat = await Chat.create({
    userId: req.userId,
    title: title || 'New Chat',
    noteIds: noteIds || [],
    context,
    category: category || 'general',
    messages: [],
  });

  res.status(201).json({
    success: true,
    data: { chat },
  });
});

// Send message and get AI response
export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required',
    });
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found',
    });
  }

  if (chat.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this chat',
    });
  }

  chat.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date(),
  });

  let aiResponse;
  try {
    aiResponse = await getGeminiResponse(message, chat.context);
  } catch (err) {
    return res.status(502).json({
      success: false,
      message: 'AI service error: ' + (err.message || 'Failed to get AI response'),
    });
  }

  chat.messages.push({
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date(),
  });

  await chat.save();

  res.status(200).json({
    success: true,
    data: {
      chat,
      message: {
        role: 'assistant',
        content: aiResponse,
      },
    },
  });
});

// Delete chat
export const deleteChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found',
    });
  }

  if (chat.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this chat',
    });
  }

  await Chat.findByIdAndDelete(req.params.chatId);

  res.status(200).json({
    success: true,
    message: 'Chat deleted successfully',
  });
});

// Toggle pin chat
export const togglePinChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found',
    });
  }

  if (chat.userId.toString() !== req.userId) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this chat',
    });
  }

  chat.isPinned = !chat.isPinned;
  await chat.save();

  res.status(200).json({
    success: true,
    data: { chat },
  });
});
