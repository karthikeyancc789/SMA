const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Import controller functions
const {
  generateQR,
  validateQR,
  getActiveSessions,
  deactivateSession
} = require('../controllers/qrController');

// Admin routes
router.post('/generate', protect, isAdmin, generateQR);
router.get('/active', protect, isAdmin, getActiveSessions);
router.put('/deactivate/:id', protect, isAdmin, deactivateSession);

// Student routes
router.post('/validate', protect, validateQR);

module.exports = router;