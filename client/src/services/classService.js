import api from './api';

const classService = {
  // Create a new class (Admin)
  createClass: async (classData) => {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  // Get faculty's classes (Admin)
  getFacultyClasses: async () => {
    const response = await api.get('/classes/faculty');
    return response.data;
  },

  // Get student's enrolled classes (Student)
  getStudentClasses: async () => {
    const response = await api.get('/classes/student');
    return response.data;
  },

  // Get single class details
  getClassById: async (classId) => {
    const response = await api.get(`/classes/${classId}`);
    return response.data;
  },

  // Update class (Admin)
  updateClass: async (classId, classData) => {
    const response = await api.put(`/classes/${classId}`, classData);
    return response.data;
  },

  // Add students to class (Admin)
  addStudents: async (classId, studentIds) => {
    const response = await api.post(`/classes/${classId}/students`, { studentIds });
    return response.data;
  },

  // Remove student from class (Admin)
  removeStudent: async (classId, studentId) => {
    const response = await api.delete(`/classes/${classId}/students/${studentId}`);
    return response.data;
  },

  // Delete class (Admin)
  deleteClass: async (classId) => {
    const response = await api.delete(`/classes/${classId}`);
    return response.data;
  }
};

export default classService;