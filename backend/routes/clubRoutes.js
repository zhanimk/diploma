const express = require('express');
const router = express.Router();
const {
    createClub,
    getClubs,
    getClubById, // Importing the new controller
    deleteClub,
    getMyClub,
    updateMyClub,
    getMyAthletes,
    respondToRequest,
    registerAthleteByCoach
} = require('../controllers/clubController');
const { protect, coach, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getClubs);
router.get('/:id', getClubById); // New public route for getting a single club by ID

// Coach routes for managing their own club
router.route('/my-club')
    .get(protect, coach, getMyClub)
    .put(protect, coach, updateMyClub);

router.post('/', protect, coach, createClub); // For creating/updating a club

router.get('/my-athletes', protect, coach, getMyAthletes);
router.put('/respond-request', protect, coach, respondToRequest);
router.post('/register-athlete', protect, coach, registerAthleteByCoach);

// Admin route to delete a club
router.delete('/:id', protect, admin, deleteClub);

module.exports = router;
