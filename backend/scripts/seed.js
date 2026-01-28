const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phone-directory')
.then(async () => {
  console.log('✅ Connected to MongoDB');

  let createdUsers = [];

  // Check if admin already exists
  const adminExists = await User.findOne({ email: 'admin@example.com' });
  
  if (adminExists) {
    console.log('ℹ️  Admin user already exists');
  } else {
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'ADMIN',
      isActive: true
    });
    createdUsers.push({ type: 'Admin', email: admin.email, password: 'admin123' });
    console.log('✅ Admin user created successfully');
  }

  // Check if regular user already exists
  const userExists = await User.findOne({ email: 'user@example.com' });
  
  if (userExists) {
    console.log('ℹ️  Regular user already exists');
  } else {
    // Create regular user
    const user = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'user123',
      role: 'USER',
      isActive: true
    });
    createdUsers.push({ type: 'User', email: user.email, password: 'user123' });
    console.log('✅ Regular user created successfully');
  }

  if (createdUsers.length > 0) {
    console.log('\n📋 Created Accounts:');
    createdUsers.forEach(account => {
      console.log(`\n${account.type} Account:`);
      console.log(`  📧 Email: ${account.email}`);
      console.log(`  🔑 Password: ${account.password}`);
    });
    console.log('\n⚠️  Please change the passwords after first login!');
  } else {
    console.log('\nℹ️  All users already exist. No new accounts created.');
  }
  
  process.exit(0);
})
.catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
