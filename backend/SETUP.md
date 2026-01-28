# Backend Setup Instructions

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create .env File

Create a `.env` file in the backend directory with the following content:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/phone-directory
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

**Important:** Change `JWT_SECRET` to a strong, random string in production!

## Step 3: Start MongoDB

Make sure MongoDB is running on your system. If using a local installation:

```bash
mongod
```

Or if using MongoDB Atlas, update the `MONGODB_URI` in `.env` with your connection string.

## Step 4: Seed Admin User

```bash
npm run seed
```

This creates an admin user:
- Email: `admin@example.com`
- Password: `admin123`

⚠️ **Change the password after first login!**

## Step 5: Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check the connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

### Port Already in Use

- Change the `PORT` in `.env` to a different port
- Or stop the process using port 5000

### Module Not Found

- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`
