const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Class = require('../models/Class');

dotenv.config({ path: '../.env' });

async function seedClasses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find the current admin user (Jothi)
    const admin = await User.findOne({ email: 'jothi@gmail.com', role: 'admin' });
    if (!admin) {
      console.log('No admin user named Jothi found.');
      process.exit(1);
    }

    const classesToSeed = [
      { className: 'CS201', subject: 'Data Structures & Algorithms', department: 'Computer Science', year: 2 },
      { className: 'CS305', subject: 'Database Management Systems', department: 'Computer Science', year: 3 },
      { className: 'CS402', subject: 'Artificial Intelligence', department: 'Computer Science', year: 4 },
      { className: 'MTH101', subject: 'Engineering Mathematics I', department: 'Mathematics', year: 1 },
      { className: 'MTH202', subject: 'Advanced Calculus & Linear Algebra', department: 'Mathematics', year: 2 },
      { className: 'PHY101', subject: 'Engineering Physics', department: 'Physics', year: 1 },
      { className: 'PHY301', subject: 'Quantum Mechanics', department: 'Physics', year: 3 },
      { className: 'ENG105', subject: 'Technical Communication & Writing', department: 'Humanities', year: 1 },
    ];

    let count = 0;
    for (const cls of classesToSeed) {
      // Check if already exists to avoid duplicates
      const exists = await Class.findOne({ className: cls.className });
      if (!exists) {
        const newClass = new Class({
          ...cls,
          faculty: admin._id,
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            radius: 100
          }
        });
        await newClass.save();
        console.log(`Successfully created class: ${cls.className}`);
        count++;
      } else {
        console.log(`Class ${cls.className} already exists. Skipping.`);
      }
    }

    console.log(`Finished seeding ${count} new classes.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding classes:', error);
    process.exit(1);
  }
}

seedClasses();
