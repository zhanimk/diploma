const express = require('express');
const router = express.Router();
const {
    createClub,
    getClubs,
    getMyClub,
    updateMyClub, // Import the new function
    getMyAthletes,
    respondToRequest,
    registerAthleteByCoach,
} = require('../controllers/clubController');
const { protect, coach } = require('../middleware/authMiddleware');

// @route   /api/clubs

// --- Public Routes ---
router.get('/', getClubs);

// --- Coach Routes (Protected) ---
router.post('/', protect, coach, createClub);
router.route('/my-club')
    .get(protect, coach, getMyClub)
    .put(protect, coach, updateMyClub); // Add the new PUT route

router.get('/my-athletes', protect, coach, getMyAthletes);
router.put('/respond-request', protect, coach, respondToRequest);
router.post('/register-athlete', protect, coach, registerAthleteByCoach);

module.exports = router;
