const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phone-directory')
.then(async () => {
  console.log('✅ Connected to MongoDB');

  // Delete existing users
  await User.deleteMany({ email: { $in: ['admin@example.com', 'user@example.com'] } });
  console.log('🗑️  Deleted existing test users');

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN',
    isActive: true
  });
  console.log('✅ Admin user created successfully');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123');

  // Create regular user
  const user = await User.create({
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    role: 'USER',
    isActive: true
  });
  console.log('✅ Regular user created successfully');
  console.log('   Email: user@example.com');
  console.log('   Password: user123');

  // Verify passwords are hashed
  const adminCheck = await User.findOne({ email: 'admin@example.com' }).select('+password');
  const userCheck = await User.findOne({ email: 'user@example.com' }).select('+password');
  
  console.log('\n🔍 Verification:');
  console.log('   Admin password hash exists:', !!adminCheck.password);
  console.log('   User password hash exists:', !!userCheck.password);
  console.log('   Admin password starts with $2b$ (bcrypt):', adminCheck.password.startsWith('$2b$'));
  console.log('   User password starts with $2b$ (bcrypt):', userCheck.password.startsWith('$2b$'));

  // Test password comparison
  const adminMatch = await adminCheck.comparePassword('admin123');
  const userMatch = await userCheck.comparePassword('user123');
  
  console.log('\n🔐 Password Test:');
  console.log('   Admin password matches:', adminMatch);
  console.log('   User password matches:', userMatch);

  if (adminMatch && userMatch) {
    console.log('\n✅ All users are ready for login!');
  } else {
    console.log('\n❌ Password comparison failed!');
  }
  
  process.exit(0);
})
.catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
