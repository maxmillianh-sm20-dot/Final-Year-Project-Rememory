# Rememory Project Setup Guide

This guide will walk you through setting up the Rememory project step by step.

## Prerequisites Check

Before starting, make sure you have:
- ✅ **Node.js** (version 18 or higher) - You have v24.11.1 ✓
- ✅ **Yarn** package manager - You have v1.22.22 ✓
- **Firebase Account** - You'll need to create a Firebase project
- **OpenAI API Key** (or compatible LLM service) - For AI conversations

## Step-by-Step Setup

### Step 1: Install Dependencies

Install dependencies for both frontend and backend:

```bash
# Install backend dependencies
cd backend
yarn install

# Install frontend dependencies
cd ../frontend
yarn install
```

### Step 2: Set Up Firebase Project

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" or select an existing project
   - Follow the setup wizard

2. **Enable Firebase Services:**
   - Go to **Authentication** → Enable "Email/Password" sign-in method
   - Go to **Firestore Database** → Create database (start in test mode for development)
   - Go to **Project Settings** → General tab

3. **Get Firebase Configuration:**
   
   **For Frontend (Client SDK):**
   - In Firebase Console → Project Settings → General
   - Scroll to "Your apps" section
   - Click the web icon (</>) to add a web app
   - Copy the Firebase configuration object
   - You'll need: `apiKey`, `authDomain`, `projectId`, `appId`, `messagingSenderId`

   **For Backend (Admin SDK):**
   - In Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file (keep it secure!)
   - You'll need: `project_id`, `client_email`, `private_key`

### Step 3: Configure Environment Variables

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
# Copy the example file
# On Windows PowerShell:
Copy-Item ..\env.example .env
# Or manually create .env file
```

Edit `backend/.env` with your values:

```env
NODE_ENV=development

# Backend Firebase Configuration
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour actual private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com

# LLM Configuration
LLM_API_KEY=your-openai-api-key
LLM_MODEL=gpt-4o-mini

# Email Configuration (optional for development)
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM=no-reply@rememory.app

# Text-to-Speech (optional)
TTS_PROVIDER=webspeech
GOOGLE_TTS_API_KEY=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=12

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:4000

# Server Port
PORT=4000
```

**Important Notes:**
- The `FIREBASE_PRIVATE_KEY` should be the entire private key from the service account JSON, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- Replace `\n` with actual newlines, or keep `\n` in the string (the code handles both)
- Never commit the `.env` file to git!

#### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
# Create .env file manually
```

Edit `frontend/.env` with your Firebase client configuration:

```env
# Frontend Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id

# Backend API URL
VITE_API_BASE_URL=http://localhost:4000
```

**Note:** All frontend environment variables must start with `VITE_` to be accessible in the React app.

### Step 4: Start the Development Servers

Open two terminal windows/tabs:

**Terminal 1 - Backend:**
```bash
cd backend
yarn dev
```

The backend should start on `http://localhost:4000`

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn dev
```

The frontend should start on `http://localhost:5173`

### Step 5: Verify Setup

1. **Check Backend:**
   - Open browser to `http://localhost:4000`
   - You should see: "Rememory Backend is running!"
   - Test health endpoint: `http://localhost:4000/health/firestore`

2. **Check Frontend:**
   - Open browser to `http://localhost:5173`
   - You should see the Rememory application

## Common Issues and Solutions

### Issue: "Missing Firebase environment variables"
**Solution:** Make sure your `backend/.env` file has all required Firebase variables and is in the `backend` directory.

### Issue: "Module not found" errors
**Solution:** Make sure you've run `yarn install` in both `backend` and `frontend` directories.

### Issue: Port already in use
**Solution:** 
- Backend: Change `PORT` in `backend/.env` to a different port (e.g., 4001)
- Frontend: The port is configured in `frontend/vite.config.ts` (default: 5173)

### Issue: Firebase authentication errors
**Solution:** 
- Verify your Firebase project has Authentication enabled
- Check that your frontend Firebase config matches your project
- Ensure Email/Password sign-in is enabled in Firebase Console

### Issue: CORS errors
**Solution:** Make sure `FRONTEND_URL` in `backend/.env` matches your frontend URL (default: `http://localhost:5173`)

### Issue: TypeScript compilation errors
**Solution:** 
- Make sure you have TypeScript installed globally or locally
- Run `yarn install` again to ensure all dependencies are installed
- Check that `tsconfig.json` files are present in both directories

## Next Steps

Once setup is complete:
- Read the documentation in the `docs/` folder
- Check `docs/architecture.md` for project structure
- Review `docs/api-design.md` for API endpoints
- See `docs/testing.md` for running tests

## Testing

Run tests to verify everything works:

```bash
# Backend tests
cd backend
yarn test

# Frontend tests
cd frontend
yarn test

# E2E tests (requires both servers running)
cd frontend
yarn test:e2e
```

## Getting Help

If you encounter issues:
1. Check the error messages carefully
2. Verify all environment variables are set correctly
3. Ensure Firebase services are enabled
4. Check that both servers are running
5. Review the documentation in the `docs/` folder

---

**Remember:** Never commit `.env` files or Firebase service account keys to version control!

