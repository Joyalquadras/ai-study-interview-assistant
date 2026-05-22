# AI Study Assistant - Production Deployment Guide

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] All environment variables configured
- [ ] Database backups in place
- [ ] SSL certificates ready
- [ ] API keys verified
- [ ] Tests passing
- [ ] Code review completed

### Backend Deployment

#### Option 1: Render.com

1. **Create account on Render.com**
2. **Create Web Service**
   - Connect GitHub repository
   - Set root directory: `/backend`
   - Set build command: `npm install`
   - Set start command: `npm start`

3. **Configure Environment**
   - Add all .env variables in Render dashboard
   - Enable auto-deploy

4. **Database**
   - Use MongoDB Atlas for cloud database
   - Update MONGODB_URI in environment

#### Option 2: Railway.app

1. Create new project
2. Connect GitHub repo
3. Configure environment variables
4. Deploy

#### Option 3: Docker + Your Server

```bash
# Build Docker image
docker build -t ai-study-backend:latest ./backend

# Run container
docker run -p 5000:5000 \
  -e MONGODB_URI=your_mongodb_uri \
  -e JWT_SECRET=your_secret \
  -e GEMINI_API_KEY=your_gemini_key \
  ai-study-backend:latest
```

### Frontend Deployment

#### Option 1: Vercel (Recommended)

1. **Push code to GitHub**
2. **Import in Vercel**
   - Connect GitHub account
   - Select repository
   - Set root directory: `frontend`

3. **Configure**
   - Environment variables in dashboard
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Deploy**
   - Auto-deploy on push

#### Option 2: Netlify

1. Connect GitHub
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `frontend`
3. Deploy

#### Option 3: Docker + Your Server

```bash
# Build Docker image
docker build -t ai-study-frontend:latest ./frontend

# Run container
docker run -p 80:5173 \
  -e VITE_API_URL=your_backend_url \
  ai-study-frontend:latest
```

### Database Setup (MongoDB Atlas)

1. **Create Account**
   - Go to mongodb.com/cloud
   - Sign up for free account

2. **Create Cluster**
   - Choose cloud provider (AWS/Google Cloud)
   - Select region
   - Configure M0 (free tier)

3. **Network Access**
   - Add your server IP
   - Allow 0.0.0.0 for development

4. **Get Connection String**
   - Copy connection string
   - Replace username and password
   - Update MONGODB_URI

### Using Docker Compose

```bash
# Clone repository
git clone your-repo-url
cd ai-study-assistant

# Create .env file
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Update environment variables
nano backend/.env
nano frontend/.env

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Post-deployment

1. **Verify Services**
   ```bash
   curl https://your-backend-url/api/health
   ```

2. **Run Database Migrations**
   - Create indexes
   - Seed initial data

3. **Test Features**
   - User registration/login
   - File uploads
   - AI features
   - API endpoints

4. **Monitor**
   - Set up error tracking (Sentry)
   - Monitor performance
   - Check logs regularly

### Performance Optimization

1. **Frontend**
   ```bash
   # Enable compression
   npm run build
   # Verify dist size
   ```

2. **Backend**
   - Enable caching headers
   - Compress responses
   - Optimize database queries

3. **Database**
   ```javascript
   // Create indexes
   db.users.createIndex({ email: 1 });
   db.notes.createIndex({ userId: 1, createdAt: -1 });
   db.chats.createIndex({ userId: 1, createdAt: -1 });
   ```

### Security Checklist

- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] API rate limiting active
- [ ] Secrets in environment variables
- [ ] Database credentials secure
- [ ] File upload validation
- [ ] Input sanitization
- [ ] CSRF protection
- [ ] Security headers (Helmet)
- [ ] Regular backups

### Monitoring & Logs

**Render/Railway:**
- Built-in logs in dashboard
- Error tracking

**Self-hosted:**
- Set up PM2 for process management
- Configure logrotate for logs
- Use nginx error logs

### Database Backup

```bash
# MongoDB Atlas automatic backups enabled

# Manual backup
mongodump --uri "your-connection-string" -o ./backup

# Restore
mongorestore ./backup
```

### Scaling

1. **Horizontal Scaling**
   - Use load balancer
   - Multiple backend instances
   - Sticky sessions for auth

2. **Vertical Scaling**
   - Upgrade server resources
   - Increase database RAM

3. **CDN**
   - CloudFlare for static files
   - Reduce server load

### Rollback Plan

1. Keep previous deployment running
2. Use blue-green deployment
3. Have database backup strategy
4. Version API endpoints

## 📞 Support

If deployment fails:
1. Check logs carefully
2. Verify environment variables
3. Test locally first
4. Check service status pages
5. Contact platform support
