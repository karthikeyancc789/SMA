const Class = require('../models/Class');
const User = require('../models/User');

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Admin)
const createClass = async (req, res) => {
  try {
    const { className, subject, department, year, section, students, schedule, location } = req.body;

    const newClass = await Class.create({
      className,
      subject,
      faculty: req.user._id,
      department,
      year,
      section,
      students: students || [],
      schedule: schedule || [],
      location: location || {}
    });

    await newClass.populate('faculty', 'name email');

    res.status(201).json({
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    console.error('Create Class Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all classes for faculty
// @route   GET /api/classes/faculty
// @access  Private (Admin)
const getFacultyClasses = async (req, res) => {
  try {
    const classes = await Class.find({ 
      faculty: req.user._id 
    })
    .populate('students', 'name rollNumber email')
    .sort('-createdAt');

    res.json({
      count: classes.length,
      classes
    });
  } catch (error) {
    console.error('Get Faculty Classes Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get classes for student
// @route   GET /api/classes/student
// @access  Private (Student)
const getStudentClasses = async (req, res) => {
  try {
    const classes = await Class.find({ 
      students: req.user._id 
    })
    .populate('faculty', 'name email department')
    .select('-students')
    .sort('-createdAt');

    res.json({
      count: classes.length,
      classes
    });
  } catch (error) {
    console.error('Get Student Classes Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single class details
// @route   GET /api/classes/:id
// @access  Private
const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('faculty', 'name email department')
      .populate('students', 'name rollNumber email department year');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check authorization
    const isFaculty = classData.faculty._id.toString() === req.user._id.toString();
    const isStudent = classData.students.some(
      student => student._id.toString() === req.user._id.toString()
    );

    if (!isFaculty && !isStudent) {
      return res.status(403).json({ message: 'Not authorized to view this class' });
    }

    res.json(classData);
  } catch (error) {
    console.error('Get Class Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin)
const updateClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is faculty of this class
    if (classData.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this class' });
    }

    const { className, subject, department, year, section, schedule, location } = req.body;

    classData.className = className || classData.className;
    classData.subject = subject || classData.subject;
    classData.department = department || classData.department;
    classData.year = year || classData.year;
    classData.section = section || classData.section;
    classData.schedule = schedule || classData.schedule;
    classData.location = location || classData.location;

    const updatedClass = await classData.save();

    res.json({
      message: 'Class updated successfully',
      class: updatedClass
    });
  } catch (error) {
    console.error('Update Class Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add students to class
// @route   POST /api/classes/:id/students
// @access  Private (Admin)
const addStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is faculty of this class
    if (classData.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this class' });
    }

    // Verify all students exist
    const students = await User.find({ 
      _id: { $in: studentIds },
      role: 'student' 
    });

    if (students.length !== studentIds.length) {
      return res.status(400).json({ message: 'Some student IDs are invalid' });
    }

    // Add students (avoiding duplicates)
    studentIds.forEach(studentId => {
      if (!classData.students.includes(studentId)) {
        classData.students.push(studentId);
      }
    });

    await classData.save();

    res.json({
      message: 'Students added successfully',
      totalStudents: classData.students.length
    });
  } catch (error) {
    console.error('Add Students Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove student from class
// @route   DELETE /api/classes/:id/students/:studentId
// @access  Private (Admin)
const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is faculty of this class
    if (classData.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this class' });
    }

    classData.students = classData.students.filter(
      student => student.toString() !== studentId
    );

    await classData.save();

    res.json({
      message: 'Student removed successfully',
      totalStudents: classData.students.length
    });
  } catch (error) {
    console.error('Remove Student Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if user is faculty of this class
    if (classData.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this class' });
    }

    await classData.deleteOne();

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete Class Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClass,
  getFacultyClasses,
  getStudentClasses,
  getClassById,
  updateClass,
  addStudents,
  removeStudent,
  deleteClass
};