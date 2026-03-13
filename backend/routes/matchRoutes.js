const express = require('express');
const router = express.Router();
const { updateMatch } = require('../controllers/matchController');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Update a match (e.g., set winner)
// @route   PUT /api/matches/:id
// @access  Private (Admin)
router.put('/:id', protect, admin, updateMatch);

module.exports = router;
