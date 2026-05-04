const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  qrSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRSession',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    default: 'present'
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance
attendanceSchema.index({ student: 1, qrSession: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);