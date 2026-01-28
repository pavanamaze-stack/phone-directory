# 🚀 Quick Start Guide

Follow these steps to get the Phone Directory application up and running.

## Prerequisites Check

- ✅ Node.js installed (v14+)
- ✅ MongoDB installed and running (or MongoDB Atlas account)

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (see below for content)
# On Windows PowerShell:
New-Item -Path .env -ItemType File
# Then add the content from SETUP.md

# Seed admin user
npm run seed

# Start backend server
npm run dev
```

**Backend .env file content:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/phone-directory
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend Setup (New Terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 4. Login

You can use either account:

**Admin Account:**
- **Email:** admin@example.com
- **Password:** admin123
- **Access:** Full admin features (manage employees, users, upload CSV)

**Regular User Account:**
- **Email:** user@example.com
- **Password:** user123
- **Access:** View-only directory access

⚠️ **Change the passwords after first login!**

## What's Next?

1. **Upload Sample Data:**
   - Login as admin
   - Go to "Manage Employees"
   - Click "Upload CSV"
   - Use the file: `backend/sample-data/employees.csv`

2. **Test Features:**
   - Browse the employee directory
   - Try search and filters
   - Create/edit employees (admin only)
   - Test CSV upload

3. **API Testing:**
   - Import `Postman_Collection.json` into Postman
   - Test all API endpoints

## Common Issues

### MongoDB Not Running
```bash
# Start MongoDB (varies by OS)
# Windows: Start MongoDB service
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Port Already in Use
- Change PORT in backend/.env
- Or stop the process using the port

### CORS Errors
- Verify FRONTEND_URL in backend/.env matches frontend URL
- Restart backend server after changing .env

## Need Help?

Check the main README.md for detailed documentation.
