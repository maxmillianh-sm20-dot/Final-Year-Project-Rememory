# Troubleshooting Guide

## "Failed to fetch" Error

If you're getting a "Failed to fetch" error when trying to create an account:

### Step 1: Verify Backend is Running
```powershell
# Check if backend is running on port 4000
netstat -ano | findstr :4000
```

You should see the backend listening on port 4000. If not, start it:
```powershell
cd backend
yarn dev
```

### Step 2: Restart Frontend Dev Server
The Vite proxy configuration only loads when the dev server starts. You MUST restart:

1. Stop the frontend server (Ctrl+C)
2. Restart it:
```powershell
cd frontend
yarn dev
```

### Step 3: Check Browser Console
Open browser DevTools (F12) and check:
- Console tab for detailed error messages
- Network tab to see if the request is being made and what response you get

### Step 4: Verify Proxy is Working
After restarting the frontend, check the terminal where `yarn dev` is running. You should see proxy logs like:
```
Proxying: POST /api/auth/signup -> /api/auth/signup
```

### Step 5: Test Backend Directly
Test if the backend endpoint works:
```powershell
curl http://localhost:4000/api/auth/signup -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@test.com","password":"testpassword123"}'
```

If this works, the backend is fine and the issue is with the frontend proxy.

### Step 6: Check Environment Variables
Make sure `frontend/.env` has:
```
VITE_API_BASE_URL=http://localhost:4000
```

But the code should use `/api` in development (which uses the Vite proxy).

### Common Issues:

1. **Frontend not restarted** - Most common! Vite proxy only works after restart.
2. **Backend not running** - Make sure backend is on port 4000
3. **Port conflict** - If 4000 is in use, change PORT in backend/.env
4. **CORS issues** - Backend CORS is configured, but make sure frontend URL matches

### Quick Fix:
1. Stop both servers (Ctrl+C in both terminals)
2. Start backend: `cd backend && yarn dev`
3. Start frontend: `cd frontend && yarn dev`
4. Try again

