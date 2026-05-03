require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: '123' }, process.env.JWT_SECRET, { expiresIn: '1d' });
console.log('✅ JWT works!');
console.log('Token:', token);