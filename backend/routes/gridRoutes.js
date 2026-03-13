const express = require('express');
const router = express.Router();
const { conductDraw } = require('../controllers/gridController');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Conduct a draw for a specific grid
// @route   POST /api/grids/:id/draw
// @access  Private (Admin)
router.post('/:id/draw', protect, admin, conductDraw);

module.exports = router;
