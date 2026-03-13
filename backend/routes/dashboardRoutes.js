const express = require('express');
const router = express.Router();
// Исправляем импорт: используем существующую функцию getDashboardData
const { getDashboardData } = require('../controllers/adminController'); 
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get system-wide statistics (for admin dashboard, footer widget etc.)
// @route   GET /api/dashboard/stats
// @access  Private/Admin
// Исправляем вызов: используем getDashboardData вместо несуществующей getSystemStats
router.get('/stats', protect, admin, getDashboardData);

module.exports = router;
