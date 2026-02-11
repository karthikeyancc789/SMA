import api from './api';

const qrService = {
  // Generate QR code for attendance
  generateQR: async (classId, expiryMinutes, location) => {
    const response = await api.post('/qr/generate', {
      classId,
      expiryMinutes,
      location
    });
    return response.data;
  },

  // Validate QR code
  validateQR: async (sessionToken) => {
    const response = await api.post('/qr/validate', { sessionToken });
    return response.data;
  },

  // Get active QR sessions
  getActiveSessions: async () => {
    const response = await api.get('/qr/active');
    return response.data;
  },

  // Deactivate QR session
  deactivateSession: async (sessionId) => {
    const response = await api.put(`/qr/deactivate/${sessionId}`);
    return response.data;
  }
};

export default qrService;