const QRCode = require('qrcode');
const crypto = require('crypto');
const QRSession = require('../models/QRSession');
const Class = require('../models/Class');

// @desc    Generate QR code for attendance
// @route   POST /api/qr/generate
// @access  Private (Admin only)
const generateQR = async (req, res) => {
  try {
    const { classId, expiryMinutes, location } = req.body;

    // Validate class
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is faculty of this class
    if (classData.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to generate QR for this class' });
    }

    // Generate unique session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Calculate expiry time
    const expiryTime = expiryMinutes || process.env.QR_EXPIRY_MINUTES || 5;
    const expiresAt = new Date(Date.now() + expiryTime * 60 * 1000);

    // Use class location if not provided
    const qrLocation = location || classData.location;

    if (!qrLocation.latitude || !qrLocation.longitude) {
      return res.status(400).json({ message: 'Location is required for QR generation' });
    }

    // Generate QR code image
    const qrCodeURL = await QRCode.toDataURL(sessionToken, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 300
    });

    // Create QR session
    const qrSession = await QRSession.create({
      classId,
      sessionToken,
      qrCodeImage: qrCodeURL,
      expiresAt,
      location: {
        latitude: qrLocation.latitude,
        longitude: qrLocation.longitude,
        radius: qrLocation.radius || 100
      }
    });

    res.status(201).json({
      message: 'QR code generated successfully',
      qrSession: {
        _id: qrSession._id,
        sessionToken: qrSession.sessionToken,
        expiresAt: qrSession.expiresAt,
        qrCodeImage: qrCodeURL
      },
      classInfo: {
        className: classData.className,
        subject: classData.subject
      }
    });
  } catch (error) {
    console.error('QR Generation Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate QR session
// @route   POST /api/qr/validate
// @access  Private (Student)
const validateQR = async (req, res) => {
  try {
    const { sessionToken } = req.body;

    // Find QR session
    const qrSession = await QRSession.findOne({ 
      sessionToken,
      isActive: true 
    }).populate('classId', 'className subject department year');

    if (!qrSession) {
      return res.status(404).json({ message: 'Invalid or expired QR code' });
    }

    // Check if expired
    if (new Date() > qrSession.expiresAt) {
      qrSession.isActive = false;
      await qrSession.save();
      return res.status(400).json({ message: 'QR code has expired' });
    }

    res.json({
      message: 'QR code is valid',
      qrSession: {
        _id: qrSession._id,
        classId: qrSession.classId._id,
        className: qrSession.classId.className,
        subject: qrSession.classId.subject,
        expiresAt: qrSession.expiresAt,
        location: qrSession.location
      }
    });
  } catch (error) {
    console.error('QR Validation Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active QR sessions for faculty
// @route   GET /api/qr/active
// @access  Private (Admin)
const getActiveSessions = async (req, res) => {
  try {
    const activeSessions = await QRSession.find({
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    .populate('classId', 'className subject')
    .sort('-createdAt')
    .limit(10);

    res.json({
      count: activeSessions.length,
      sessions: activeSessions
    });
  } catch (error) {
    console.error('Get Sessions Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Deactivate QR session
// @route   PUT /api/qr/deactivate/:id
// @access  Private (Admin)
const deactivateSession = async (req, res) => {
  try {
    const qrSession = await QRSession.findById(req.params.id);

    if (!qrSession) {
      return res.status(404).json({ message: 'Session not found' });
    }

    qrSession.isActive = false;
    await qrSession.save();

    res.json({ message: 'Session deactivated successfully' });
  } catch (error) {
    console.error('Deactivate Session Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ⚠️ IMPORTANT: Export all functions
module.exports = {
  generateQR,
  validateQR,
  getActiveSessions,
  deactivateSession
};