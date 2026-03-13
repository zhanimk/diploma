const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/adminController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// @desc    Get all data for the admin dashboard
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, admin, getDashboardData);

module.exports = router;
