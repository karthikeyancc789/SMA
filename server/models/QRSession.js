const mongoose = require('mongoose');

const qrSessionSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true
  },
  qrCodeImage: {
    type: String,
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number,
    radius: Number
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }  // TTL index - auto-delete when expires
  },
  studentsMarked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QRSession', qrSessionSchema);