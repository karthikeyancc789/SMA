const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Import controller (create this file next)
const {
  markAttendance,
  getStudentAttendance,
  getClassAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');

// Student routes
router.post('/mark', protect, markAttendance);
router.get('/student', protect, getStudentAttendance);
router.get('/stats', protect, getAttendanceStats);

// Admin routes
router.get('/class/:classId', protect, isAdmin, getClassAttendance);

module.exports = router;