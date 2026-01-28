# Build and Run (Production-style)

## Quick start

1. **Build frontend and run the project**
   - Double-click **`npm-build-and-run.bat`** in the project folder.
   - Or from a terminal:
     ```bash
     npm-build-and-run.bat
     ```
   - This will:
     1. Run `npm run build` in the frontend (creates `frontend/dist/`)
     2. Start the backend, which serves both the API and the built frontend

2. **Open the app**
   - In your browser go to: **http://localhost:5000**
   - API: **http://localhost:5000/api**

## Manual steps

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Start backend (serves API + frontend build)
cd ../backend
node server.js
```

Then open **http://localhost:5000**.

## Login

- **Admin:** admin@example.com / admin123  
- **User:** user@example.com / user123  

## Notes

- Backend serves the frontend build from `frontend/dist/` when that folder exists.
- MongoDB must be running (local or Atlas).
- Ensure `backend/.env` is set (see backend README).
