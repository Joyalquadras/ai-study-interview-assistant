# 🚀 Complete Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure Overview](#project-structure-overview)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Running the Application](#running-the-application)
8. [Common Issues & Solutions](#common-issues--solutions)
9. [Production Deployment](#production-deployment)

---

## Prerequisites

Before you start, ensure you have:

### System Requirements
- **OS**: Windows, macOS, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB free space

### Software Requirements
```bash
# Check versions
node --version      # Should be >= 18.x
npm --version       # Should be >= 9.x
git --version       # Should be installed
```

**Installation Links:**
- [Node.js & npm](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/download)
- [MongoDB Compass](https://www.mongodb.com/products/compass) (Optional, for GUI)
- [Postman](https://www.postman.com/downloads/) (For API testing)

### Online Accounts
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Free cloud database
- [Google Cloud Console](https://console.cloud.google.com/) - For Gemini API
- [GitHub](https://github.com/) - For version control

---

## Project Structure Overview

```
AI Study Assistant/
├── backend/                 # Node.js + Express backend
│   ├── config/             # Database & multer config
│   ├── controllers/        # Business logic
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth, error handling
│   ├── services/           # External API integrations
│   ├── uploads/            # Uploaded files
│   ├── .env.example        # Environment template
│   ├── server.js           # Express app entry
│   └── package.json        # Dependencies
│
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   ├── context/        # State management
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utilities
│   │   ├── App.jsx         # Root component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite config
│   ├── tailwind.config.js  # Tailwind config
│   ├── .env.example        # Environment template
│   └── package.json        # Dependencies
│
├── docker-compose.yml      # Docker orchestration
├── .gitignore             # Git ignore rules
├── README.md              # Project documentation
├── API.md                 # API documentation
├── DEPLOYMENT.md          # Deployment guide
└── SETUP.md              # This file
```

---

## Backend Setup

### Step 1: Clone or Navigate to Backend

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all packages from `package.json`:
- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT tokens
- bcryptjs - Password hashing
- multer - File uploads
- pdf-parse - PDF text extraction
- And more...

### Step 3: Create Environment File

```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables

Edit `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB - Using Atlas (Replace with your URI)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-study-db?retryWrites=true&w=majority

# JWT Secret (Generate random string)
JWT_SECRET=generate-random-string-at-least-32-characters
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=another-random-string-32-characters
JWT_REFRESH_EXPIRE=30d

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-from-google-cloud

# Frontend
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,txt

# Rate Limiting
RATE_LIMIT_WINDOW_MS=15000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

### Step 5: Verify Backend Works

```bash
# Start development server
npm run dev
```

**Expected Output:**
```
MongoDB Connected: cluster.mongodb.net
Server running on port 5000
Environment: development
```

**Test the API:**
```bash
curl http://localhost:5000/api/health
# Response: {"success":true,"message":"API is running"}
```

---

## Frontend Setup

### Step 1: Navigate to Frontend

```bash
cd ../frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=AI Study Assistant
VITE_APP_VERSION=1.0.0
```

### Step 5: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  dev server running at:

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Visit `http://localhost:5173` in your browser.

---

## Database Setup

### Option A: MongoDB Atlas (Cloud - Recommended)

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Sign up with email or Google

2. **Create Cluster**
   - Click "Create" button
   - Choose "Free" tier
   - Select your region (pick closest to you)
   - Name: `ai-study-cluster`
   - Click "Create Cluster"

3. **Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Add `0.0.0.0/0` (allow all)
   - For production: Add your server IP only

4. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `admin`
   - Password: (generate secure password)
   - Built-in roles: `Admin`

5. **Get Connection String**
   - Click "Connect" on cluster
   - Choose "Drivers"
   - Select Node.js driver
   - Copy connection string
   - Replace `<username>` and `<password>`
   - Update `MONGODB_URI` in `.env`

### Option B: MongoDB Community (Local)

**Windows:**
1. Download [MongoDB Community](https://www.mongodb.com/try/download/community)
2. Run installer
3. Use default settings
4. Connection string: `mongodb://localhost:27017/ai-study-db`

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### Verify Database Connection

```bash
# MongoDB Atlas
mongodb+srv://username:password@cluster.mongodb.net/ai-study-db

# Local
mongodb://localhost:27017/ai-study-db
```

---

## Environment Configuration

### Getting API Keys

#### Google Gemini API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable "Generative Language API"
4. Create API key (Go to Credentials → Create Credentials → API Key)
5. Copy key to `GEMINI_API_KEY` in `.env`

#### JWT Secrets

Generate secure random strings:

```bash
# Linux/macOS
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Max 256) }))

# Or use online generator
# https://generate-random.org/api/v1/base64
```

---

## Running the Application

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

Expected: Server running on port 5000

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

Expected: Server running on port 5173

### Visit Application

1. Open browser
2. Go to `http://localhost:5173`
3. Register a new account
4. Login
5. Start using the app!

### Test Features

**Upload a Note:**
1. Go to "Notes" section
2. Click "Upload Notes"
3. Select a PDF or TXT file
4. Click "Upload Note"

**Start a Chat:**
1. Go to "Chat" section
2. Create new chat
3. Type a message
4. AI responds using Gemini API

**Analyze Resume:**
1. Upload resume as note
2. Go to "Resume Analyzer"
3. Click "Analyze"
4. Get detailed feedback

---

## Common Issues & Solutions

### Issue 1: MongoDB Connection Failed

**Error:**
```
Error connecting to MongoDB: Could not connect to any servers in your MongoDB Atlas cluster
```

**Solutions:**
1. Check internet connection
2. Verify MongoDB URI is correct
3. Check IP whitelist in MongoDB Atlas
4. Verify username/password

**Test Connection:**
```bash
# From backend directory
node -e "require('./config/database').default()"
```

### Issue 2: GEMINI_API_KEY Error

**Error:**
```
Error: GEMINI_API_KEY is not defined or invalid
```

**Solutions:**
1. Verify API key in `.env`
2. Check API is enabled in Google Cloud
3. Ensure API key has no restrictions
4. Regenerate API key if needed

### Issue 3: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
```bash
# Kill process using port 5000 (Linux/macOS)
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001

# Windows - Find and kill
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue 4: npm install fails

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still fails, try
npm install --legacy-peer-deps
```

### Issue 5: CORS Error

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**
1. Check `FRONTEND_URL` in backend `.env`
2. Restart backend server
3. Clear browser cache
4. Check browser console for exact error

---

## Production Deployment

### Quick Checklist

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database backups configured
- [ ] SSL certificates ready
- [ ] Rate limiting configured
- [ ] Error logging setup
- [ ] Monitoring tools enabled

### Deploy Backend (Render.com)

1. Push code to GitHub
2. Create account on render.com
3. New Web Service → Connect GitHub
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

### Deploy Frontend (Vercel)

1. Push code to GitHub
2. Create account on vercel.com
3. Import project → Select GitHub repo
4. Framework: Vite
5. Root directory: `frontend`
6. Build: `npm run build`
7. Output: `dist`
8. Deploy

### Post-Deployment

```bash
# Test API
curl https://your-backend-url/api/health

# Test frontend
curl https://your-frontend-url

# Monitor logs
# Use dashboard on Render/Vercel
```

---

## Next Steps

1. **Read Documentation**
   - [README.md](./README.md) - Project overview
   - [API.md](./API.md) - API documentation
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

2. **Customize**
   - Update branding
   - Add your features
   - Configure integrations

3. **Deploy**
   - Follow production deployment guide
   - Set up monitoring
   - Configure backups

4. **Scale**
   - Add more features
   - Optimize performance
   - Scale infrastructure

---

## Support & Resources

- **Issues**: Check [GitHub Issues](https://github.com/your-repo/issues)
- **Docs**: Read [API.md](./API.md)
- **Community**: Join Discord server
- **Email**: support@aistudyassistant.com

---

## Troubleshooting Guide

### Debug Mode

Set `LOG_LEVEL=debug` in `.env` for verbose logging.

### Check Service Status

```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend (check network tab in browser DevTools)
# Look for API calls and responses
```

### Database Debugging

```bash
# Connect to MongoDB
mongosh "mongodb+srv://username:password@cluster.mongodb.net/ai-study-db"

# List collections
show collections

# Check users
db.users.find()

# Clear data (be careful!)
db.users.deleteMany({})
```

### Clear Browser Cache

```bash
# Press in browser
Ctrl + Shift + Delete  # Windows
Cmd + Shift + Delete   # Mac
```

---

**🎉 You're all set! Enjoy building with AI Study Assistant!**
