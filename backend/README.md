# Phone Directory Backend API

A secure, scalable backend API for a Phone Directory Web Application built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT-based authentication
- 👥 Role-based access control (ADMIN, USER)
- 📊 Employee directory management
- 📁 CSV file upload with validation
- 🔍 Advanced search, filter, and pagination
- 🛡️ Security best practices (helmet, CORS, rate limiting)
- 📝 Upload history and error logging

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend directory**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and update the following:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/phone-directory
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

4. **Start MongoDB**

Make sure MongoDB is running on your system. If using a local installation:

```bash
mongod
```

Or if using MongoDB Atlas, update the `MONGODB_URI` in `.env`.

5. **Seed admin user**

```bash
npm run seed
```

This will create two users:

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`
- Role: ADMIN

**Regular User:**
- Email: `user@example.com`
- Password: `user123`
- Role: USER

**⚠️ Change the passwords after first login!**

6. **Start the server**

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Employees (Protected - All Users)

- `GET /api/employees` - Get all employees (with search, filter, sort, pagination)
- `GET /api/employees/:id` - Get single employee
- `GET /api/employees/departments` - Get list of departments

### Admin Routes (Protected - Admin Only)

- `POST /api/admin/employees` - Create employee
- `PUT /api/admin/employees/:id` - Update employee
- `DELETE /api/admin/employees/:id` - Delete employee
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user (activate/deactivate)
- `GET /api/admin/upload-history` - Get upload history
- `GET /api/admin/upload-history/:id` - Get upload log details

### Upload (Protected - Admin Only)

- `POST /api/upload/csv` - Upload CSV file

## API Usage Examples

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Employees (with search and pagination)

```bash
GET /api/employees?search=john&page=1&limit=10&sort=fullName&order=asc&department=Engineering&status=active
Authorization: Bearer <token>
```

### Upload CSV

```bash
POST /api/upload/csv
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <CSV file>
```

## CSV File Format

The CSV file should have the following columns:

- `fullName` (required)
- `email` (required, unique)
- `phoneNumber` (required)
- `extension` (optional)
- `department` (required)
- `jobTitle` (optional)
- `officeLocation` (optional)
- `status` (optional, default: "active")

See `sample-data/employees.csv` for an example.

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on API routes
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- CSV injection prevention

## Project Structure

```
backend/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # Express routes
├── scripts/         # Utility scripts (seed, etc.)
├── uploads/         # Uploaded files (temporary)
├── utils/           # Utility functions
├── sample-data/     # Sample CSV files
├── server.js        # Entry point
└── package.json
```

## Error Handling

The API uses centralized error handling. All errors are returned in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Optional validation errors
}
```

## License

ISC
