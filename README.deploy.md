# Deployment Guide - Separate Frontend & Backend

## Architecture
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Socket.io)

---

## Backend Deployment (Render)

### 1. Push backend to GitHub
```bash
git add .
git commit -m "Prepare backend for Render"
git push origin main
```

### 2. Deploy on Render
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. **Important**: Set root directory to `backend`
5. Configure:
   - **Name**: prime-chain-game-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Click "Create Web Service"

### 3. Get Backend URL
After deployment, you'll get a URL like:
```
https://prime-chain-game-backend.onrender.com
```
**Save this URL - you'll need it for frontend!**

---

## Frontend Deployment (Vercel)

### 1. Update Environment Variable
Edit `frontend/.env.production` with your Render backend URL:
```
VITE_BACKEND_URL=https://prime-chain-game-backend.onrender.com
```

### 2. Push to GitHub
```bash
git add frontend/.env.production
git commit -m "Update production backend URL"
git push origin main
```

### 3. Deploy on Vercel
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - Key: `VITE_BACKEND_URL`
   - Value: `https://prime-chain-game-backend.onrender.com`
6. Click "Deploy"

---

## Configuration Files

### Backend (Render)
- `render.yaml` - Render configuration
- Root directory: `backend`

### Frontend (Vercel)
- `vercel.json` - Vercel configuration
- Root directory: `frontend`
- Environment: `frontend/.env.production`

---

## Important Notes

### Backend (Render Free Tier)
- Sleeps after 15 minutes of inactivity
- First request may take 30-60 seconds to wake up
- CORS configured to allow all origins

### Frontend (Vercel)
- Instant deployment on git push
- Automatic HTTPS
- Global CDN

### Environment Variables
- **Local Dev**: `frontend/.env` → `http://localhost:3000`
- **Production**: `frontend/.env.production` → Your Render URL

---

## Testing Locally

### Backend
```bash
cd backend
npm install
npm run dev
```
Runs on http://localhost:3000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

---

## Troubleshooting

### CORS Issues
If you get CORS errors, update `backend/src/server.ts`:
```typescript
cors: {
    origin: "https://your-vercel-app.vercel.app",
    methods: ["GET", "POST"]
}
```

### Socket Connection Issues
1. Check backend URL in Vercel environment variables
2. Ensure backend is awake (visit backend URL in browser)
3. Check browser console for connection errors
