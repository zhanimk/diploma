const express = require('express');
const router = express.Router();
const {
    createClub,
    getClubs,
    deleteClub, // Importing the new controller function
    getMyClub,
    updateMyClub,
    getMyAthletes,
    respondToRequest,
    registerAthleteByCoach
} = require('../controllers/clubController');
const { protect, coach, admin } = require('../middleware/authMiddleware');

// Public route to get all clubs
router.get('/', getClubs);

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
