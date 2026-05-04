const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Class = require('../models/Class');

dotenv.config({ path: '../.env' });

async function seedClass() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find the first admin user (the one logged in)
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found. Please register an admin first.');
      process.exit(1);
    }

    const newClass = new Class({
      className: 'CS101',
      subject: 'Intro to Programming',
      department: 'Computer Science',
      year: '1',
      faculty: admin._id,
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 100
      }
    });

    await newClass.save();
    console.log('Successfully created class:', newClass.className);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding class:', error);
    process.exit(1);
  }
}

seedClass();
