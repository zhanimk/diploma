const express = require('express');
const router = express.Router();
const {
    createClub,
    getClubs,
    getClubById, 
    deleteClub,
    getMyClub,
    updateMyClub,
    getMyAthletes,
    respondToRequest,
    registerAthleteByCoach,
    verifyClub 
} = require('../controllers/clubController');
const { protect, coach, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getClubs);
router.get('/:id', getClubById);

// Coach routes
router.post('/', protect, coach, createClub);
router.route('/my-club')
    .get(protect, coach, getMyClub)
    .put(protect, coach, updateMyClub);
router.get('/my-athletes', protect, coach, getMyAthletes);
router.put('/respond-request', protect, coach, respondToRequest);
router.post('/register-athlete', protect, coach, registerAthleteByCoach);

// Admin route
router.put('/:id/verify', protect, admin, verifyClub);
router.delete('/:id', protect, admin, deleteClub);

module.exports = router;
