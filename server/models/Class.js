const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  department: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  section: String,
  schedule: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  location: {
    name: String,
    latitude: Number,
    longitude: Number,
    radius: {
      type: Number,
      default: 100
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', classSchema);