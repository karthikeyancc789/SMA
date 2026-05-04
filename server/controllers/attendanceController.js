const Attendance = require('../models/Attendance');
const QRSession = require('../models/QRSession');
const Class = require('../models/Class');
const { isWithinRadius } = require('../utils/validateLocation');

// @desc    Mark attendance by scanning QR
// @route   POST /api/attendance/mark
// @access  Private (Student)
const markAttendance = async (req, res) => {
  try {
    const { sessionToken, location, deviceInfo } = req.body;
    const studentId = req.user._id;

    // Validate QR session
    const qrSession = await QRSession.findOne({ 
      sessionToken,
      isActive: true 
    }).populate('classId');

    if (!qrSession) {
      return res.status(404).json({ message: 'Invalid or expired QR code' });
    }

    // Check if expired
    if (new Date() > qrSession.expiresAt) {
      qrSession.isActive = false;
      await qrSession.save();
      return res.status(400).json({ message: 'QR code has expired' });
    }

    // Check if student is enrolled in this class
    const classData = qrSession.classId;
    const isEnrolled = classData.students.some(
      student => student.toString() === studentId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({ message: 'You are not enrolled in this class' });
    }

    // Check for duplicate attendance
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      qrSession: qrSession._id
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        message: 'Attendance already marked for this session',
        attendance: existingAttendance
      });
    }

    // Validate location
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: 'Location is required' });
    }

    const isLocationValid = isWithinRadius(
      location.latitude,
      location.longitude,
      qrSession.location.latitude,
      qrSession.location.longitude,
      qrSession.location.radius
    );

    if (!isLocationValid) {
      return res.status(400).json({ 
        message: 'You are not within the allowed location to mark attendance',
        requiredLocation: {
          latitude: qrSession.location.latitude,
          longitude: qrSession.location.longitude,
          radius: qrSession.location.radius
        }
      });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      student: studentId,
      class: classData._id,
      qrSession: qrSession._id,
      status: 'present',
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      deviceInfo: {
        userAgent: deviceInfo?.userAgent,
        ipAddress: deviceInfo?.ipAddress
      }
    });

    // Add student to marked list
    qrSession.studentsMarked.push(studentId);
    await qrSession.save();

    // Populate attendance data
    await attendance.populate('class', 'className subject');

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: {
        _id: attendance._id,
        className: attendance.class.className,
        subject: attendance.class.subject,
        status: attendance.status,
        markedAt: attendance.markedAt
      }
    });
  } catch (error) {
    console.error('Mark Attendance Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's attendance history
// @route   GET /api/attendance/student
// @access  Private (Student)
const getStudentAttendance = async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;
    const studentId = req.user._id;

    const query = { student: studentId };

    if (classId) {
      query.class = classId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('class', 'className subject department')
      .sort('-createdAt')
      .limit(100);

    // Calculate statistics
    const totalClasses = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = totalClasses > 0 
      ? ((presentCount / totalClasses) * 100).toFixed(2) 
      : 0;

    res.json({
      attendance,
      statistics: {
        totalClasses,
        present: presentCount,
        absent: totalClasses - presentCount,
        percentage: attendancePercentage
      }
    });
  } catch (error) {
    console.error('Get Student Attendance Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get class attendance report
// @route   GET /api/attendance/class/:classId
// @access  Private (Admin)
const getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify class exists and user is faculty
    const classData = await Class.findById(classId).populate('students', 'name rollNumber email department');
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (classData.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this class attendance' });
    }

    const query = { class: classId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get all attendance logs for the class in the date range
    const attendanceLogs = await Attendance.find(query);

    // Calculate total sessions held (by counting unique qrSession object IDs in the logs)
    const uniqueSessions = new Set(attendanceLogs.map(log => log.qrSession.toString()));
    const totalSessions = uniqueSessions.size;

    let totalPresentOverall = 0;
    let totalPercentageOverall = 0;

    // Aggregate attendance per enrolled student
    const aggregatedAttendance = classData.students.map(student => {
      const studentLogs = attendanceLogs.filter(
        log => log.student.toString() === student._id.toString()
      );
      
      const presentCount = studentLogs.filter(log => log.status === 'present').length;
      const absentCount = totalSessions - presentCount;
      const percentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

      totalPresentOverall += presentCount;
      totalPercentageOverall += percentage;

      return {
        student: {
          name: student.name,
          rollNumber: student.rollNumber,
          department: student.department || 'N/A'
        },
        totalClasses: totalSessions,
        present: presentCount,
        absent: Math.max(0, absentCount),
        percentage: percentage
      };
    });

    const totalStudents = classData.students.length;
    const totalAbsentOverall = (totalStudents * totalSessions) - totalPresentOverall;
    const averagePercentage = totalStudents > 0 ? totalPercentageOverall / totalStudents : 0;

    res.json({
      classInfo: {
        className: classData.className,
        subject: classData.subject,
        totalStudents: classData.students.length
      },
      stats: {
        totalStudents,
        totalPresent: totalPresentOverall,
        totalAbsent: Math.max(0, totalAbsentOverall),
        averagePercentage
      },
      attendance: aggregatedAttendance
    });
  } catch (error) {
    console.error('Get Class Attendance Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance statistics for dashboard
// @route   GET /api/attendance/stats
// @access  Private
const getAttendanceStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (userRole === 'student') {
      // Student statistics
      const totalAttendance = await Attendance.countDocuments({ student: userId });
      const presentCount = await Attendance.countDocuments({ 
        student: userId, 
        status: 'present' 
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAttendance = await Attendance.countDocuments({
        student: userId,
        createdAt: { $gte: today }
      });

      const percentage = totalAttendance > 0 
        ? ((presentCount / totalAttendance) * 100).toFixed(2) 
        : 0;

      res.json({
        totalClasses: totalAttendance,
        present: presentCount,
        absent: totalAttendance - presentCount,
        percentage,
        todayClasses: todayAttendance
      });
    } else {
      // Admin statistics
      const classes = await Class.find({ faculty: userId });
      const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0);
      const totalSessions = await QRSession.countDocuments();
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todaySessions = await QRSession.countDocuments({
        createdAt: { $gte: todayStart }
      });

      res.json({
        totalClasses: classes.length,
        totalStudents,
        totalSessions,
        todaySessions
      });
    }
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance,
  getClassAttendance,
  getAttendanceStats
};