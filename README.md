Here's the complete updated README with new live link and all new features:

````markdown
# 🎓 AI Study & Interview Preparation Assistant

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue?style=for-the-badge)](https://ai-study-interview-assistant.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Joyalquadras/ai-study-interview-assistant)

A production-ready full-stack web application that helps students prepare for interviews and exams using AI-powered tools, intelligent note management, and personalized learning plans.

🔗 **Live Demo:** https://ai-study-interview-assistant.vercel.app/
💻 **GitHub:** https://github.com/Joyalquadras/ai-study-interview-assistant

## ✨ Features

### 🔐 Authentication System
- User registration and login with JWT tokens
- Access token + Refresh token mechanism
- Password hashing with bcrypt
- Protected routes and role-based access control
- Secure logout functionality
- **Guest Mode** — try the full app without registering

### 👋 Guest Mode
- One-click access without registration
- Pre-populated demo data (notes, study plan, chat history)
- Full access to all features
- Guest banner with register prompt
- Try as Guest button on landing page and login page

### 📊 Dashboard
- Personalized dashboard showing study progress
- Quick access to recent notes and AI conversations
- Study statistics and progress tracking
- Interview preparation tracker
- Quick action buttons for all features
- 🔥 Daily streak system with heatmap
- Daily micro-challenge widget

### 📝 PDF/Notes Upload & Management
- Upload PDF notes, resumes, and study materials
- Automatic text extraction from PDFs
- Organize notes with categories and tags
- Search and filter functionality
- View note statistics (views, file size)

### 💬 AI Chat with Context
- ChatGPT-like interface with message history
- Ask questions based on uploaded notes
- Groq API (LLaMA 3.3 70B) integration
- Streaming responses with typing effects
- Persistent chat history in database
- Support for multiple conversations

### 🤖 AI-Powered Features
- **Summary Generation** — create concise summaries of any content
- **Question Generation** — auto-generate important questions from notes
- **MCQ Creation** — generate multiple-choice questions for practice
- **Flashcard Generation** — create study flashcards automatically
- **Interview Questions** — generate category-specific interview questions
- **Study Roadmaps** — AI-created structured learning plans
- **Resume Bullet Generator** — turn notes into ATS-friendly resume bullets

### 📄 Resume Analyzer
- Upload and analyze resume PDFs
- ATS score calculation
- Missing keywords detection
- Improvement suggestions
- Skills extraction (technical & soft skills)
- Formatting recommendations
- Detailed feedback and score breakdown

### 🎯 Interview Preparation Module
Supported categories:
- HR Questions
- JavaScript
- React
- Node.js
- MongoDB
- DSA (Data Structures & Algorithms)
- Blockchain Basics

Features:
- AI mock interviewer
- **3 Interview Personas** — Friendly Mentor, Strict Panelist, Skeptic
- Intelligent feedback and scoring
- Multiple difficulty levels (Easy, Medium, Hard)
- Timer mode for realistic practice
- Response evaluation and suggestions
- Performance tracking

### 📚 Study Planner
- AI-generated personalized study plans
- Set custom study goals with topics and target date
- Daily task management with resources
- Smart prioritization
- Progress tracking
- View previous plans

### 🎯 Job Description Gap Analyzer *(New)*
- Paste any job description
- AI compares it with your resume skills
- Match score with visual progress ring
- Matched vs missing skills breakdown
- Priority study topics with direct note links
- AI recommendation paragraph

### 📖 STAR Story Bank *(New)*
- Save behavioral interview stories (Situation, Task, Action, Result)
- AI automatically maps each story to HR questions
- Expandable story cards with mapped questions
- Practice button links directly to mock interview
- Tag-based organization

### 📊 Quiz Analytics — Confidence Calibration *(New)*
- Rate confidence (1-5) before answering MCQs
- Tracks overconfidence (high confidence + wrong answers)
- Tracks underestimated knowledge (low confidence + correct)
- Bar chart showing accuracy per confidence level
- Personalized insight cards

### 🔥 Daily Streak System *(New)*
- Daily micro-challenges (MCQ, Flashcard, Mock Question, Summary)
- Streak counter with flame emoji
- Weekly activity heatmap
- 30-day contribution graph (GitHub-style)
- Challenge modal with AI-generated questions

### 🎨 Modern UI/UX
- Clean, responsive design
- Dark/light mode support
- Toast notifications for user feedback
- Loading skeletons for better UX
- Comprehensive form validation
- Reusable component library
- Mobile-first design approach
- Smooth animations and transitions
- Beautiful landing page with gradient hero

## 📁 Project Structure

```
AI Study Assistant/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── multer.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── noteController.js
│   │   ├── chatController.js
│   │   ├── resumeController.js
│   │   ├── studyPlanController.js
│   │   ├── interviewController.js
│   │   ├── gapAnalyzerController.js
│   │   ├── quizController.js
│   │   ├── streakController.js
│   │   └── starStoryController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Note.js
│   │   ├── Chat.js
│   │   ├── ResumeAnalysis.js
│   │   ├── StudyPlan.js
│   │   ├── MockInterview.js
│   │   ├── GapAnalysis.js
│   │   ├── QuizAttempt.js
│   │   ├── Streak.js
│   │   └── StarStory.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── studyPlanRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── gapAnalyzerRoutes.js
│   │   ├── quizRoutes.js
│   │   ├── streakRoutes.js
│   │   └── starStoryRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── asyncHandler.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── logger.js
│   ├── services/
│   │   └── geminiService.js
│   ├── seed/
│   │   └── guestSeed.js
│   ├── uploads/
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── CommonComponents.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── GuestBanner.jsx
│   │   │   │   ├── MCQQuiz.jsx
│   │   │   │   ├── FlipCard.jsx
│   │   │   │   ├── CircularProgress.jsx
│   │   │   │   ├── DropZone.jsx
│   │   │   │   └── TypingIndicator.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── NotesManager.jsx
│   │   │   │   ├── StreakWidget.jsx
│   │   │   │   └── HeatmapWidget.jsx
│   │   │   └── chat/
│   │   │       └── ChatInterface.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── NotesPage.jsx
│   │   │   ├── NoteDetail.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── ResumePage.jsx
│   │   │   ├── StudyPlansPage.jsx
│   │   │   ├── MockInterviewPage.jsx
│   │   │   ├── GapAnalyzerPage.jsx
│   │   │   ├── StarStoriesPage.jsx
│   │   │   └── QuizAnalyticsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   ├── authStore.js
│   │   │   └── themeStore.js
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm or yarn
- MongoDB database (local or MongoDB Atlas)
- Groq API key (free at console.groq.com)
- Git

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env file:**
```bash
cp .env.example .env
```

4. **Configure environment variables:**
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-study-db

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRE=30d

# Groq API (free at console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

5. **Seed guest demo data (optional):**
```bash
node seed/guestSeed.js
```

6. **Start the backend server:**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env file:**
```bash
cp .env.example .env
```

4. **Configure environment variables:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=AI Study Assistant
```

5. **Start the development server:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register           - Register new user
POST   /api/auth/login              - Login user
POST   /api/auth/guest              - Guest login (no credentials needed)
POST   /api/auth/logout             - Logout user
POST   /api/auth/refresh-token      - Refresh access token
GET    /api/auth/me                 - Get current user
PUT    /api/auth/update-profile     - Update user profile
```

### Notes Endpoints
```
GET    /api/notes                   - Get all notes (paginated)
GET    /api/notes/:id               - Get single note
POST   /api/notes/upload            - Upload new note (PDF/TXT)
POST   /api/notes/generate-content  - Generate AI content from note
PUT    /api/notes/:id               - Update note
DELETE /api/notes/:id               - Delete note
```

### Chat Endpoints
```
GET    /api/chats                   - Get all chats
POST   /api/chats                   - Create new chat
GET    /api/chats/:chatId           - Get single chat
POST   /api/chats/:chatId/message   - Send message (get AI response)
DELETE /api/chats/:chatId           - Delete chat
```

### Resume Analysis Endpoints
```
POST   /api/resume/analyze          - Analyze resume PDF
POST   /api/resume/generate-bullets - Generate resume bullets from notes
GET    /api/resume                  - Get all analyses
```

### Study Plans Endpoints
```
GET    /api/study-plans             - Get all plans
POST   /api/study-plans             - Create new plan
GET    /api/study-plans/:id         - Get single plan
DELETE /api/study-plans/:id         - Delete plan
```

### Interview Endpoints
```
POST   /api/interviews/start        - Start new interview (with persona)
POST   /api/interviews/respond      - Submit answer get feedback
POST   /api/interviews/end          - End interview get report
GET    /api/interviews              - Get all interviews
```

### New Feature Endpoints
```
POST   /api/gap-analyzer            - Analyze job description gap
GET    /api/gap-analyzer/history    - Get past analyses

POST   /api/quiz/submit-answer      - Submit MCQ answer with confidence
GET    /api/quiz/analytics          - Get confidence analytics

GET    /api/streak/today            - Get today's challenge + streak
POST   /api/streak/complete         - Mark challenge complete

POST   /api/star-stories            - Create STAR story
GET    /api/star-stories            - Get all stories
DELETE /api/star-stories/:id        - Delete story
```

## 🔧 Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Groq API — LLaMA 3.3 70B
- Multer (File uploads)
- pdf-parse (PDF extraction)
- Bcryptjs (Password hashing)
- Helmet (Security headers)

**Frontend:**
- React 18
- Vite
- React Router v6
- Axios
- TailwindCSS
- Zustand (State management)
- React Hot Toast (Notifications)
- Recharts (Analytics charts)

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

## 🔐 Security Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Protected API routes
- ✅ Secure file upload handling
- ✅ Environment variable protection

## 🎯 Future Enhancements

- [ ] Voice-to-text input for questions
- [ ] Speech synthesis for AI answers
- [ ] LeetCode progress tracker integration
- [ ] Email OTP verification
- [ ] Google OAuth login
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard

## 📄 License

This project is licensed under the ISC License.

## 📞 Contact

- **Email:** joyalquadras95@gmail.com
- **GitHub:** https://github.com/Joyalquadras/ai-study-interview-assistant
- **Live Demo:** https://ai-study-interview-assistant.vercel.app/

---

**Made with ❤️ by Joyal Quadras**
````
