# Phone Directory Frontend

A modern, responsive React frontend for the Phone Directory Web Application.

## Features

- 🔐 User authentication (Login/Register)
- 📱 Responsive design
- 🔍 Advanced search and filtering
- 📊 Employee directory with pagination
- 👑 Admin dashboard for user and employee management
- 📁 CSV file upload
- 🎨 Clean, professional UI

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`

## Installation

1. **Navigate to frontend directory**

```bash
cd frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Start development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── context/         # React context (Auth)
│   ├── pages/           # Page components
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## Features Overview

### Authentication
- Login page
- Registration page
- JWT token management
- Protected routes

### Employee Directory
- View all employees
- Search by name, email, phone, or department
- Filter by department and status
- Sort by name or department
- Pagination

### Admin Dashboard
- User management (activate/deactivate)
- Upload history
- Employee management (CRUD operations)
- CSV file upload

## API Integration

The frontend communicates with the backend API through axios. The API base URL is configured in `src/utils/api.js` and proxies through Vite's dev server.

## Environment Variables

If needed, create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## License

ISC
