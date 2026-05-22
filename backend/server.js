import './config/env.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';

import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger as logRequest } from './middleware/logger.js';
import limiter from './middleware/rateLimiter.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import simpleChatRoutes from './routes/simpleChatRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import studyPlanRoutes from './routes/studyPlanRoutes.js';
import simpleStudyPlanRoutes from './routes/simpleStudyPlanRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import simpleInterviewRoutes from './routes/simpleInterviewRoutes.js';
import gapAnalyzerRoutes from './routes/gapAnalyzerRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import streakRoutes from './routes/streakRoutes.js';
import starStoryRoutes from './routes/starStoryRoutes.js';

// Validate required env variables
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is missing in .env');
}

if (!process.env.GROQ_API_KEY?.trim()) {
  throw new Error('GROQ_API_KEY is missing in backend/.env');
}

if (
  process.env.GROQ_API_KEY.includes('YOUR_') ||
  process.env.GROQ_API_KEY === 'your_groq_api_key'
) {
  throw new Error(
    'GROQ_API_KEY is still a placeholder — add a real key from https://console.groq.com'
  );
}

// Initialize app
const app = express();

// Connect Database
connectDB();

/* ======================================================
   MIDDLEWARE
====================================================== */

// Security headers
app.use(helmet());

// Allowed frontend origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5174',
];

// Allow localhost ports during development
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5173');
  allowedOrigins.push('http://localhost:5174');
  allowedOrigins.push('http://localhost:5175');
  allowedOrigins.push('http://localhost:5176');
  allowedOrigins.push('http://localhost:5177');
}

// CORS configuration
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow requests without origin
      // (Postman, mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow listed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow localhost in development
      if (
        process.env.NODE_ENV === 'development' &&
        /^https?:\/\/localhost(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      // Reject other origins
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logger middleware
app.use(logRequest);

// Rate limiter
app.use(limiter);

/* ======================================================
   ROUTES
====================================================== */

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running successfully',
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/chat', simpleChatRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/study-plan', simpleStudyPlanRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/interview', simpleInterviewRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/gap-analyzer', gapAnalyzerRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/star-stories', starStoryRoutes);

/* ======================================================
   404 HANDLER
====================================================== */

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/* ======================================================
   ERROR HANDLER
====================================================== */

app.use(errorHandler);

/* ======================================================
   SERVER
====================================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('====================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log('====================================');
});

export default app;