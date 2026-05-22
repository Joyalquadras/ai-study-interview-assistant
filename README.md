# 🎓 AI Study & Interview Preparation Assistant

A production-ready full-stack web application that helps students prepare for interviews and exams using AI-powered tools, intelligent note management, and personalized learning plans.

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
- Google Gemini API integration
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
│   │   ├── database.js          # MongoDB connection
│   │   └── multer.js            # File upload configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── noteController.js    # Note management
│   │   ├── chatController.js    # Chat functionality
│   │   ├── resumeController.js  # Resume analysis
│   │   ├── studyPlanController.js # Study plans
│   │   └── interviewController.js # Mock interviews
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Note.js              # Note schema
│   │   ├── Chat.js              # Chat schema
│   │   ├── ResumeAnalysis.js    # Resume analysis schema
│   │   ├── StudyPlan.js         # Study plan schema
│   │   └── MockInterview.js     # Mock interview schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── noteRoutes.js        # Note endpoints
│   │   ├── chatRoutes.js        # Chat endpoints
│   │   ├── resumeRoutes.js      # Resume endpoints
│   │   ├── studyPlanRoutes.js   # Study plan endpoints
│   │   └── interviewRoutes.js   # Interview endpoints
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── errorHandler.js      # Error handling
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── logger.js            # Request logging
│   ├── services/
│   │   └── geminiService.js     # Google Gemini API integration
│   ├── uploads/                 # Uploaded files storage
│   ├── .env.example             # Environment variables template
│   ├── server.js                # Express server setup
│   └── package.json             # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── AuthGuard.jsx
│   │   │   ├── common/
│   │   │   │   ├── CommonComponents.jsx  # Reusable UI components
│   │   │   │   ├── ProtectedRoute.jsx    # Route protection
│   │   │   │   └── Sidebar.jsx           # Navigation sidebar
│   │   │   ├── chat/
│   │   │   │   └── ChatInterface.jsx     # Chat component
│   │   │   └── dashboard/
│   │   │       └── NotesManager.jsx      # Notes management
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx             # Login page
│   │   │   ├── RegisterPage.jsx          # Registration page
│   │   │   ├── DashboardPage.jsx         # Main dashboard
│   │   │   ├── NotesPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── ResumePage.jsx
│   │   │   ├── StudyPlanPage.jsx
│   │   │   └── InterviewPage.jsx
│   │   ├── services/
│   │   │   └── api.js                    # API client configuration
│   │   ├── context/
│   │   │   ├── authStore.js              # Auth state management
│   │   │   └── themeStore.js             # Theme management
│   │   ├── hooks/
│   │   │   └── useCustom.js              # Custom hooks
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx            # Main layout wrapper
│   │   ├── utils/
│   │   │   └── helpers.js                # Utility functions
│   │   ├── App.jsx                       # Main app component
│   │   ├── main.jsx                      # App entry point
│   │   └── index.css                     # Global styles
│   ├── index.html                        # HTML template
│   ├── tailwind.config.js                # Tailwind CSS config
│   ├── postcss.config.js                 # PostCSS config
│   ├── vite.config.js                    # Vite configuration
│   ├── .env.example                      # Frontend environment template
│   └── package.json                      # Frontend dependencies
│
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm or yarn
- MongoDB database (local or MongoDB Atlas)
- Google Gemini API key
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
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRE=30d

# Google Gemini API
GROQ_API_KEY=your_google_gemini_api_key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Optional: Email configuration for OTP
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
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
PUT    /api/study-plans/:id/task/:taskIndex - Update task
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

## 🔧 Development

### Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Google Gemini API
- Multer (File uploads)
- pdf-parse (PDF extraction)
- Bcryptjs (Password hashing)
- Express Validator (Input validation)
- Helmet (Security headers)

**Frontend:**
- React 18
- Vite
- React Router v6
- Axios
- TailwindCSS
- Zustand (State management)
- React Hot Toast (Notifications)

### Running Tests

```bash
# Backend tests (when added)
cd backend
npm run test

# Frontend tests (when added)
cd frontend
npm run test
```

### Building for Production

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🌐 Deployment

### Backend Deployment (Render)

1. Push your code to GitHub
2. Connect your repository to Render
3. Set environment variables in Render dashboard
4. Deploy with Node.js configuration

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy automatically

### Database (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create a cluster
3. Get connection string
4. Add it to backend .env as MONGODB_URI

## 📋 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development/production |
| MONGODB_URI | MongoDB connection | mongodb+srv://user:pass@cluster.mongodb.net/db |
| JWT_SECRET | JWT secret key | your_secret_key_here |
| JWT_EXPIRE | JWT expiration | 7d |
| GEMINI_API_KEY | Google Gemini API key | your_gemini_key |
| FRONTEND_URL | Frontend URL | http://localhost:5173 |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |
| VITE_APP_NAME | App name | AI Study Assistant |

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Refresh token mechanism
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
- Image optimization
- API response caching
- Database indexing
- Pagination for large datasets
- Debouncing and throttling
- CSS minification
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
- [ ] Daily streak system
- [ ] Email OTP verification
- [ ] Google OAuth login
- [ ] Collaboration features
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Video tutorials integration
- [ ] Peer review system

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see LICENSE file for details.

## 🤝 Support

For support, email support@aistudyassistant.com or create an issue in the repository.

## 📞 Contact

- Website: [aistudyassistant.com](https://aistudyassistant.com)
- Email: hello@aistudyassistant.com
- Twitter: [@aistudyapp](https://twitter.com/aistudyapp)

---

**Made with ❤️ by the AI Study Assistant Team**
