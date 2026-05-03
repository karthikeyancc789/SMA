require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB...');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'EXISTS' : 'MISSING');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB works!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB failed:', err.message);
    process.exit(1);
  });