import api from './api';

const attendanceService = {
  markAttendance: async (sessionToken, location, deviceInfo) => {
    const response = await api.post('/attendance/mark', {
      sessionToken,
      location,
      deviceInfo
    });
    return response.data;
  },

  getStudentAttendance: async () => {
    const response = await api.get('/attendance/student');
    return response.data;
  },

  getClassAttendance: async (classId, dateRange) => {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
    
    const queryString = params.toString();
    const url = `/attendance/class/${classId}${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getAttendanceStats: async () => {
    const response = await api.get('/attendance/stats');
    return response.data;
  }
};

export default attendanceService;
