# Quick Start Guide - Rememory

## ✅ What's Been Done

1. **Fixed Backend Issues:**
   - Removed hardcoded Firebase service account import
   - Updated server.ts to use proper Firebase initialization
   - Added missing dependencies (openai, pino, pino-http, pino-pretty, firebase-functions)
   - Updated server.ts to use the main app with all routes

2. **Installed Dependencies:**
   - ✅ Backend dependencies installed
   - ✅ Frontend dependencies installed

3. **Created Documentation:**
   - `SETUP_GUIDE.md` - Comprehensive step-by-step setup instructions
   - `QUICK_START.md` - This file

## 🚀 Next Steps to Get Running

### 1. Set Up Firebase (Required)

You need to:
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Get your Firebase configuration

### 2. Create Environment Files

**Backend (.env in `backend/` folder):**
```bash
cd backend
# Create .env file and add your Firebase Admin SDK credentials
```

**Frontend (.env in `frontend/` folder):**
```bash
cd frontend
# Create .env file and add your Firebase Client SDK config
```

See `SETUP_GUIDE.md` for detailed instructions on what to put in these files.

### 3. Start the Servers

**Terminal 1 - Backend:**
```powershell
cd backend
yarn dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
yarn dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## 📋 Checklist

- [ ] Create Firebase project
- [ ] Enable Firebase Authentication
- [ ] Enable Firestore Database
- [ ] Create `backend/.env` with Firebase Admin credentials
- [ ] Create `frontend/.env` with Firebase Client config
- [ ] Add OpenAI API key to `backend/.env`
- [ ] Start backend server (`yarn dev` in backend folder)
- [ ] Start frontend server (`yarn dev` in frontend folder)
- [ ] Test the application

## 🔧 Common Commands

```bash
# Backend
cd backend
yarn dev          # Start development server
yarn build        # Build for production
yarn test         # Run tests

# Frontend
cd frontend
yarn dev          # Start development server
yarn build        # Build for production
yarn test         # Run unit tests
yarn test:e2e     # Run E2E tests
```

## ⚠️ Important Notes

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Firebase Service Account Key** - Keep it secure, never share it
3. **OpenAI API Key** - Required for chat functionality
4. **Port Conflicts** - If ports 4000 or 5173 are in use, change them in the config files

## 📚 Full Documentation

For detailed setup instructions, troubleshooting, and architecture information, see:
- `SETUP_GUIDE.md` - Complete setup walkthrough
- `docs/` folder - Architecture, API design, testing, etc.

## 🆘 Need Help?

If you encounter issues:
1. Check `SETUP_GUIDE.md` for detailed troubleshooting
2. Verify all environment variables are set correctly
3. Ensure Firebase services are enabled
4. Check that both servers are running

---

**You're all set! Follow the steps above to get your Rememory project running.** 🎉

