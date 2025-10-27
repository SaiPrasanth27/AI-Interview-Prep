# Deployment Guide

This guide will help you deploy your AI Interview Prep application with the frontend on Vercel and backend on Render.

## Prerequisites

1. GitHub account
2. Vercel account (free tier available)
3. Render account (free tier available)
4. MongoDB Atlas account (free tier available)
5. Google AI Studio account for Gemini API
6. Cloudinary account (free tier available)

## Backend Deployment on Render

### Step 1: Prepare Your Repository

1. Push your code to GitHub
2. Make sure your `.env` file is NOT committed (it should be in `.gitignore`)

### Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string (replace `<password>` with your actual password)
5. Whitelist all IP addresses (0.0.0.0/0) for Render deployment

### Step 3: Deploy on Render

1. Go to [Render](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ai-interview-prep-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 4: Set Environment Variables on Render

In your Render service dashboard, go to "Environment" and add:

```
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
GEMINI_API_KEY=your-gemini-api-key-from-google-ai-studio
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://your-vercel-app-name.vercel.app
PORT=10000
```

### Step 5: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL (e.g., `https://your-app-name.onrender.com`)

## Frontend Deployment on Vercel

### Step 1: Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 2: Set Environment Variables on Vercel

In your Vercel project dashboard, go to "Settings" → "Environment Variables" and add:

```
REACT_APP_API_URL=https://your-render-backend-url.onrender.com/api
```

### Step 3: Update Backend CORS

After deploying frontend, update the `FRONTEND_URL` environment variable on Render with your actual Vercel URL.

### Step 4: Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at `https://your-project-name.vercel.app`

## Post-Deployment Steps

### 1. Test Your Deployment

Visit your frontend URL and test:
- User registration/login
- Document upload
- Chat functionality

### 2. Update CORS Settings

Make sure your backend's `FRONTEND_URL` environment variable matches your Vercel deployment URL.

### 3. Monitor Logs

- **Render**: Check function logs in your Render dashboard
- **Vercel**: Check function logs in your Vercel dashboard

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `FRONTEND_URL` is set correctly on Render
2. **API Connection Issues**: Verify `REACT_APP_API_URL` is set correctly on Vercel
3. **Database Connection**: Ensure MongoDB Atlas allows connections from all IPs
4. **File Upload Issues**: Check Cloudinary credentials
5. **AI Chat Issues**: Verify Gemini API key is valid

### Environment Variables Checklist

**Render (Backend):**
- [ ] NODE_ENV
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] GEMINI_API_KEY
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] FRONTEND_URL
- [ ] PORT

**Vercel (Frontend):**
- [ ] REACT_APP_API_URL

## Free Tier Limitations

- **Render**: 750 hours/month, sleeps after 15 minutes of inactivity
- **Vercel**: 100GB bandwidth, 6000 build minutes/month
- **MongoDB Atlas**: 512MB storage
- **Cloudinary**: 25 credits/month

## Custom Domain (Optional)

1. **Vercel**: Go to project settings → Domains
2. **Render**: Available on paid plans only

Your application should now be fully deployed and accessible via your Vercel URL!