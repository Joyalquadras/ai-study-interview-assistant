
# 🎓 AI Study & Interview Preparation Assistant

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue?style=for-the-badge)](https://ai-study-assistant-ni28-2xa9pm9lh-joyalquadras-projects.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Joyalquadras/ai-study-interview-assistant)

A production-ready full-stack web application that helps students prepare for interviews and exams using AI-powered tools, intelligent note management, and personalized learning plans.

🔗 **Live Demo:** https://ai-study-assistant-ni28-2xa9pm9lh-joyalquadras-projects.vercel.app/
💻 **GitHub:** https://github.com/Joyalquadras/ai-study-interview-assistant

## ✨ Features

### 🔐 Authentication System
- User registration and login with JWT tokens
- Access token + Refresh token mechanism
- Password hashing with bcrypt
- Protected routes and role-based access control
- Secure logout functionality

### 📊 Dashboard
- Personalized dashboard showing study progress
- Quick access to recent notes and AI conversations
- Study statistics and progress tracking
- Interview preparation tracker
- Quick action buttons for all features

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
- **Summary Generation**: Create concise summaries of any content
- **Question Generation**: Auto-generate important questions from notes
- **MCQ Creation**: Generate multiple-choice questions for practice
- **Flashcard Generation**: Create study flashcards automatically
- **Interview Questions**: Generate category-specific interview questions
- **Study Roadmaps**: AI-created structured learning plans

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
- Intelligent feedback and scoring
- Multiple difficulty levels (Beginner, Intermediate, Advanced)
- Timer mode for realistic practice
- Response evaluation and suggestions
- Performance tracking

### 📚 Study Planner
- AI-generated personalized study plans
- Set custom study goals
- Daily task management
- Smart prioritization
- Progress tracking
- Flexible scheduling (days, weeks, months)

### 🎨 Modern UI/UX
- Clean, responsive design
- Dark/light mode support
- Toast notifications for user feedback
- Loading skeletons for better UX
- Comprehensive form validation
- Reusable component library
- Mobile-first design approach
- Smooth animations and transitions

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
│   │   └── interviewController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Note.js
│   │   ├── Chat.js
│   │   ├── ResumeAnalysis.js
│   │   ├── StudyPlan.js
│   │   └── MockInterview.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── studyPlanRoutes.js
│   │   └── interviewRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── logger.js
│   ├── services/
│   │   └── geminiService.js
│   ├── uploads/
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── AuthGuard.jsx
│   │   │   ├── common/
│   │   │   │   ├── CommonComponents.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── chat/
│   │   │   │   └── ChatInterface.jsx
│   │   │   └── dashboard/
│   │   │       └── NotesManager.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── NotesPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── ResumePage.jsx
│   │   │   ├── StudyPlanPage.jsx
│   │   │   └── InterviewPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   ├── authStore.js
│   │   │   └── themeStore.js
│   │   ├── hooks/
│   │   │   └── useCustom.js
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
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

5. **Start the backend server:**
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
PUT    /api/chats/:chatId/toggle-pin - Toggle pin status
```

### Resume Analysis Endpoints
```
POST   /api/resume/:noteId/analyze  - Analyze resume
GET    /api/resume/:noteId          - Get analysis results
GET    /api/resume                  - Get all analyses
```

### Study Plans Endpoints
```
GET    /api/study-plans             - Get all plans
POST   /api/study-plans             - Create new plan
GET    /api/study-plans/:id         - Get single plan
PUT    /api/study-plans/:id         - Update plan
DELETE /api/study-plans/:id         - Delete plan
```

### Interview Endpoints
```
GET    /api/interviews              - Get all interviews
POST   /api/interviews/start        - Start new interview
GET    /api/interviews/:id          - Get interview details
POST   /api/interviews/:id/submit-response/:questionId - Submit response
PUT    /api/interviews/:id/complete - Complete interview
DELETE /api/interviews/:id          - Delete interview
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

## 📈 Performance Optimizations

- Code splitting and lazy loading
- API response caching
- Database indexing
- Pagination for large datasets
- Debouncing and throttling
- JavaScript bundling

## 🐛 Error Handling

- Comprehensive error middleware
- User-friendly error messages
- Proper HTTP status codes
- Validation error feedback
- Toast notifications for errors
- Error logging

## 🎯 Future Enhancements

- [ ] Voice-to-text input for questions
- [ ] Speech synthesis for AI answers
- [ ] LeetCode progress tracker integration
- [ ] Email OTP verification
- [ ] Google OAuth login
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Contact

- **Email:** joyalquadras95@gmail.com
- **GitHub:** https://github.com/Joyalquadras/ai-study-interview-assistant
- **Live Demo:** https://ai-study-assistant-ni28-2xa9pm9lh-joyalquadras-projects.vercel.app/

---

**Made with ❤️ by Joyal Quadras**
````
