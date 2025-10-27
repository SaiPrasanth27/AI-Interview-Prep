# Deployment Checklist

## Pre-Deployment Setup

### 1. External Services Setup
- [ ] MongoDB Atlas cluster created and configured
- [ ] Google AI Studio account with Gemini API key
- [ ] Cloudinary account with API credentials
- [ ] GitHub repository created and code pushed

### 2. Environment Variables Prepared
- [ ] All required environment variables documented
- [ ] `.env.example` files created
- [ ] Production values ready (no localhost URLs)

## Backend Deployment (Render)

### 1. Service Creation
- [ ] New Web Service created on Render
- [ ] GitHub repository connected
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`

### 2. Environment Variables Set
- [ ] NODE_ENV=production
- [ ] MONGODB_URI (Atlas connection string)
- [ ] JWT_SECRET (long random string)
- [ ] GEMINI_API_KEY
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] FRONTEND_URL (will update after frontend deployment)
- [ ] PORT=10000

### 3. Deployment Verification
- [ ] Service deployed successfully
- [ ] Health check endpoint working: `/api/health`
- [ ] Backend URL noted for frontend configuration

## Frontend Deployment (Vercel)

### 1. Project Creation
- [ ] New project created on Vercel
- [ ] GitHub repository connected
- [ ] Root directory set to `client`
- [ ] Framework preset: Create React App

### 2. Environment Variables Set
- [ ] REACT_APP_API_URL (Render backend URL + /api)

### 3. Deployment Verification
- [ ] Frontend deployed successfully
- [ ] Application loads without errors
- [ ] Frontend URL noted for backend CORS update

## Post-Deployment Configuration

### 1. CORS Update
- [ ] Update FRONTEND_URL on Render with actual Vercel URL
- [ ] Redeploy backend service

### 2. End-to-End Testing
- [ ] User registration works
- [ ] User login works
- [ ] Document upload works (both resume and job description)
- [ ] Chat functionality works
- [ ] AI responses are generated
- [ ] File citations display correctly

### 3. Performance Check
- [ ] Frontend loads quickly
- [ ] API responses are reasonable
- [ ] No console errors in browser
- [ ] Mobile responsiveness verified

## Monitoring Setup

### 1. Error Tracking
- [ ] Check Render logs for backend errors
- [ ] Check Vercel logs for frontend errors
- [ ] Monitor MongoDB Atlas metrics

### 2. Performance Monitoring
- [ ] Render service metrics
- [ ] Vercel analytics
- [ ] API response times

## Backup Plan

### 1. Rollback Strategy
- [ ] Previous working commit identified
- [ ] Rollback procedure documented
- [ ] Database backup strategy in place

### 2. Environment Recovery
- [ ] All environment variables backed up securely
- [ ] Service configuration documented
- [ ] DNS/domain settings documented (if applicable)

## Success Criteria

- [ ] Application accessible via public URL
- [ ] All core features working
- [ ] No critical errors in logs
- [ ] Performance acceptable
- [ ] Mobile-friendly interface
- [ ] Secure HTTPS connections

## Next Steps After Deployment

- [ ] Share application URL with stakeholders
- [ ] Set up monitoring alerts
- [ ] Plan for scaling if needed
- [ ] Document maintenance procedures
- [ ] Consider custom domain setup