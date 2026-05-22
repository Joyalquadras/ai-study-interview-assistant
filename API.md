# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <access_token>
```

### Update Profile
```http
PUT /auth/update-profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "bio": "Student",
  "preferredLanguages": ["JavaScript", "Python"],
  "studyGoals": ["Master React", "Learn DSA"]
}
```

---

## Notes Endpoints

### Get All Notes
```http
GET /notes?page=1&limit=10&category=notes&search=keyword
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `category` - Filter by category (notes, resume, study-material, interview-prep)
- `search` - Search in title and description

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "_id": "note_id",
        "title": "React Basics",
        "description": "React fundamentals",
        "fileType": "pdf",
        "fileSize": 1024000,
        "category": "notes",
        "tags": ["react", "frontend"],
        "views": 5,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50
    }
  }
}
```

### Get Single Note
```http
GET /notes/:id
Authorization: Bearer <access_token>
```

### Upload Note
```http
POST /notes/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

form-data:
- file: <PDF or TXT file>
- title: "My Notes"
- description: "Note description"
- category: "notes"
- tags: "["tag1", "tag2"]"
```

### Update Note
```http
PUT /notes/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "study-material",
  "tags": ["updated", "tag"],
  "isPublic": false
}
```

### Delete Note
```http
DELETE /notes/:id
Authorization: Bearer <access_token>
```

---

## Chat Endpoints

### Get All Chats
```http
GET /chats?page=1&limit=20
Authorization: Bearer <access_token>
```

### Create New Chat
```http
POST /chats
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Chat with React Notes",
  "noteIds": ["note_id_1", "note_id_2"],
  "category": "notes-based"
}
```

### Get Chat with Messages
```http
GET /chats/:chatId
Authorization: Bearer <access_token>
```

### Send Message
```http
POST /chats/:chatId/message
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "What is React?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chat": {
      "messages": [
        {
          "role": "user",
          "content": "What is React?",
          "timestamp": "2024-01-15T10:30:00Z"
        },
        {
          "role": "assistant",
          "content": "React is a JavaScript library...",
          "timestamp": "2024-01-15T10:30:05Z"
        }
      ]
    },
    "message": {
      "role": "assistant",
      "content": "React is a JavaScript library..."
    }
  }
}
```

### Delete Chat
```http
DELETE /chats/:chatId
Authorization: Bearer <access_token>
```

### Toggle Pin Chat
```http
PUT /chats/:chatId/toggle-pin
Authorization: Bearer <access_token>
```

---

## Resume Analysis Endpoints

### Analyze Resume
```http
POST /resume/:noteId/analyze
Authorization: Bearer <access_token>
```

### Get Resume Analysis
```http
GET /resume/:noteId
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "atsScore": 85,
      "keywords": {
        "found": ["React", "Node.js"],
        "missing": ["TypeScript", "AWS"]
      },
      "skills": {
        "technical": ["JavaScript", "React", "Node.js"],
        "soft": ["Leadership", "Communication"]
      },
      "improvements": [
        {
          "title": "Add More Keywords",
          "description": "Include more relevant keywords",
          "priority": "high"
        }
      ],
      "strengths": ["Clear structure", "Good formatting"],
      "overallFeedback": "Good resume...",
      "recommendedKeywords": ["TypeScript", "AWS"],
      "formattingSuggestions": [],
      "scoringBreakdown": {
        "content": 85,
        "formatting": 90,
        "keywords": 80,
        "structure": 85
      }
    }
  }
}
```

---

## Study Plans Endpoints

### Get All Study Plans
```http
GET /study-plans?page=1&limit=10&isActive=true
Authorization: Bearer <access_token>
```

### Create Study Plan
```http
POST /study-plans
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "React Mastery",
  "description": "Learn React thoroughly",
  "goal": "Become a React expert",
  "category": "skill-learning",
  "difficulty": "intermediate",
  "duration": {
    "value": 30,
    "unit": "days"
  },
  "generateAI": true
}
```

### Get Single Plan
```http
GET /study-plans/:id
Authorization: Bearer <access_token>
```

### Update Plan
```http
PUT /study-plans/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "progress": 50,
  "isActive": true
}
```

### Update Task
```http
PUT /study-plans/:id/task/:taskIndex
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Task",
  "isCompleted": true,
  "priority": "high"
}
```

---

## Interview Endpoints

### Get All Interviews
```http
GET /interviews?page=1&limit=10&category=javascript&status=completed
Authorization: Bearer <access_token>
```

### Start Interview
```http
POST /interviews/start
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "React Interview Practice",
  "category": "react",
  "difficulty": "intermediate",
  "duration": 30,
  "questionsCount": 5
}
```

### Submit Response
```http
POST /interviews/:id/submit-response/:questionId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "userResponse": "React is a JavaScript library...",
  "timeSpent": 120
}
```

### Complete Interview
```http
PUT /interviews/:id/complete
Authorization: Bearer <access_token>
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Server error message"
}
```

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Headers:** 
  - `RateLimit-Limit`: Maximum requests
  - `RateLimit-Remaining`: Remaining requests
  - `RateLimit-Reset`: Reset timestamp

---

## Pagination

All list endpoints support pagination:

```http
GET /api/endpoint?page=1&limit=10
```

Response includes:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100
    }
  }
}
```

---

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123","confirmPassword":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get notes
curl http://localhost:5000/api/notes \
  -H "Authorization: Bearer <access_token>"

# Upload note
curl -X POST http://localhost:5000/api/notes/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/file.pdf" \
  -F "title=My Note"
```
