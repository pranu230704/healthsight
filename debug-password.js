const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./server/models/User');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB\n');
  
  const adminUser = await User.findOne({ username: 'admin' });
  
  console.log('Admin user found:', !!adminUser);
  console.log('Stored hash:', adminUser.password);
  console.log('');
  
  const testPassword = 'admin123';
  console.log('Testing password:', testPassword);
  console.log('');
  
  // Test bcrypt directly
  console.log('Direct bcrypt test:');
  const directMatch = await bcrypt.compare(testPassword, adminUser.password);
  console.log('Direct bcrypt match:', directMatch);
  console.log('');
  
  // Test with method
  console.log('Using comparePassword method:');
  const methodMatch = await adminUser.comparePassword(testPassword);
  console.log('Method match:', methodMatch);
  
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
