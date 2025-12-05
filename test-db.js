const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./server/models/User');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Get all users
  const users = await User.find({});
  console.log('\n📋 Users in database:');
  console.log('Count:', users.length);
  
  users.forEach(user => {
    console.log(`\n- Username: ${user.username}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Active: ${user.isActive}`);
    console.log(`  Has password: ${user.password ? 'Yes' : 'No'}`);
  });
  
  // Test password comparison
  if (users.length > 0) {
    console.log('\n🔐 Testing password for admin user:');
    const adminUser = users.find(u => u.username === 'admin');
    if (adminUser) {
      const isMatch = await adminUser.comparePassword('admin123');
      console.log(`Password "admin123" matches: ${isMatch}`);
    }
  }
  
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
