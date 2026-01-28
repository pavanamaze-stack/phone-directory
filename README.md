# 📞 Phone Directory Web Application

A secure, scalable Phone Directory Web Application with authentication, role-based access control, CSV import, and MongoDB as the database.

## 🎯 Features

### Authentication & Authorization
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (ADMIN, USER)

### Admin Features
- ✅ Admin Dashboard
- ✅ CSV file upload with validation
- ✅ Bulk insert and update (upsert by email)
- ✅ View, edit, delete employee records
- ✅ Activate/deactivate users
- ✅ View upload history and logs

### User Features
- ✅ View employee directory
- ✅ Search, filter, and sort employees
- ✅ Read-only access

### Technical Features
- ✅ MongoDB with Mongoose
- ✅ RESTful API
- ✅ Pagination
- ✅ Advanced search and filtering
- ✅ Security best practices (helmet, CORS, rate limiting)
- ✅ Input validation and sanitization
- ✅ CSV injection prevention

## 🏗️ Architecture

```
phone-directory/
├── backend/          # Node.js + Express API
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # Express routes
│   ├── scripts/      # Utility scripts
│   └── server.js     # Entry point
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
└── README.md
```

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher) - Local installation or MongoDB Atlas
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd "Asset Management"
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Windows PowerShell:
Copy-Item .env.example .env

# Or manually create .env with:
# PORT=5000
# NODE_ENV=development
# MONGODB_URI=mongodb://localhost:27017/phone-directory
# JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# JWT_EXPIRE=7d
# FRONTEND_URL=http://localhost:3000

# Seed admin user
npm run seed

# Start backend server
npm run dev
```

The backend will run on `http://localhost:5000`

**Default Accounts Created:**

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`
- Role: ADMIN (full access)

**Regular User Account:**
- Email: `user@example.com`
- Password: `user123`
- Role: USER (view-only access)

⚠️ **Change the passwords after first login!**

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

### Backend

```
backend/
├── controllers/        # Business logic
│   ├── authController.js
│   ├── employeeController.js
│   ├── adminController.js
│   └── uploadController.js
├── middleware/         # Custom middleware
│   ├── auth.js        # JWT authentication
│   ├── errorHandler.js
│   └── validator.js
├── models/            # MongoDB schemas
│   ├── User.js
│   ├── Employee.js
│   └── UploadLog.js
├── routes/            # API routes
│   ├── auth.js
│   ├── employees.js
│   ├── admin.js
│   └── upload.js
├── scripts/           # Utility scripts
│   └── seed.js        # Seed admin user
├── sample-data/       # Sample CSV files
│   └── employees.csv
├── server.js          # Entry point
└── package.json
```

### Frontend

```
frontend/
├── src/
│   ├── components/    # Reusable components
│   │   └── Layout.jsx
│   ├── context/       # React context
│   │   └── AuthContext.jsx
│   ├── pages/         # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Directory.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── Dashboard.jsx
│   ├── utils/         # Utility functions
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Employees (Protected)
- `GET /api/employees` - Get all employees (with search, filter, sort, pagination)
- `GET /api/employees/:id` - Get single employee
- `GET /api/employees/departments` - Get departments list

### Admin Routes (Admin Only)
- `POST /api/admin/employees` - Create employee
- `PUT /api/admin/employees/:id` - Update employee
- `DELETE /api/admin/employees/:id` - Delete employee
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/upload-history` - Get upload history
- `GET /api/admin/upload-history/:id` - Get upload log details

### Upload (Admin Only)
- `POST /api/upload/csv` - Upload CSV file

See `Postman_Collection.json` for detailed API examples.

## 📊 CSV Upload Format

The CSV file should have the following columns:

| Column | Required | Description |
|--------|----------|-------------|
| fullName | Yes | Employee's full name |
| email | Yes | Email address (unique) |
| phoneNumber | Yes | Phone number |
| extension | No | Extension number |
| department | Yes | Department name |
| jobTitle | No | Job title |
| officeLocation | No | Office location |
| status | No | active or inactive (default: active) |

See `backend/sample-data/employees.csv` for an example.

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Rate limiting on API routes
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ CSV injection prevention
- ✅ Role-based access control

## 🧪 Testing

### Using Postman

1. Import `Postman_Collection.json` into Postman
2. Set the `baseUrl` variable to `http://localhost:5000/api`
3. Start with the "Login" request to get a token
4. The token will be automatically saved for subsequent requests

### Sample CSV Upload

Use the sample CSV file at `backend/sample-data/employees.csv` to test the upload functionality.

## 📝 Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/phone-directory
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

## 🛠️ Development

### Backend

```bash
cd backend
npm run dev    # Development with nodemon
npm start      # Production
npm run seed   # Seed admin user
```

### Frontend

```bash
cd frontend
npm run dev    # Development server
npm run build  # Production build
npm run preview # Preview production build
```

## 📦 Production Deployment

### Backend

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure MongoDB connection string
4. Set up proper CORS origins
5. Use process manager (PM2, etc.)

### Frontend

1. Build the application: `npm run build`
2. Serve the `dist` folder with a web server (nginx, Apache, etc.)
3. Configure API proxy if needed

## 🐳 Docker

Run everything with Docker Compose:

```bash
docker compose up --build
```

Then open **http://localhost:3000**. See [DOCKER.md](DOCKER.md) for details.

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check the connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

### CORS Errors

- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check browser console for specific CORS errors

### Authentication Issues

- Verify JWT_SECRET is set
- Check token expiration
- Ensure token is sent in Authorization header: `Bearer <token>`

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ using Node.js, Express, React, and MongoDB**
