const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

const {
  createClass,
  getFacultyClasses,
  getStudentClasses,
  getClassById,
  updateClass,
  addStudents,
  removeStudent,
  deleteClass
} = require('../controllers/classController');

// Admin routes
router.post('/', protect, isAdmin, createClass);
router.get('/faculty', protect, isAdmin, getFacultyClasses);
router.put('/:id', protect, isAdmin, updateClass);
router.delete('/:id', protect, isAdmin, deleteClass);
router.post('/:id/students', protect, isAdmin, addStudents);
router.delete('/:id/students/:studentId', protect, isAdmin, removeStudent);

// Both admin and student routes
router.get('/student', protect, getStudentClasses);
router.get('/:id', protect, getClassById);

module.exports = router;