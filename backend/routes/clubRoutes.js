const express = require('express');
const router = express.Router();
const {
    createClub,
    getClubs,
    getMyClub,
    getMyAthletes,
    respondToRequest,
    registerAthleteByCoach, // Import the new controller
} = require('../controllers/clubController');
const { protect, coach } = require('../middleware/authMiddleware');

// @route   /api/clubs

// --- Public Routes ---
// Get a list of all clubs for athlete registration form
router.get('/', getClubs);

// --- Coach Routes (Protected) ---
// Create a new club
router.post('/', protect, coach, createClub);

// Get the coach's own club details and pending athletes
router.get('/my-club', protect, coach, getMyClub);

// Get all approved athletes for the coach's club
router.get('/my-athletes', protect, coach, getMyAthletes);

// Respond to an athlete's request to join the club
router.put('/respond-request', protect, coach, respondToRequest);

// Register a new athlete into the coach's club
router.post('/register-athlete', protect, coach, registerAthleteByCoach);

module.exports = router;
