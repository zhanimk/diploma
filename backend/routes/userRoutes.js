const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    getUserById,
    updateAthleteProfileByCoach,
    getAthleteTournaments,
    getStudentRequests,
    handleAthleteRequest
} = require('../controllers/userController');
const { protect, admin, coach } = require('../middleware/authMiddleware');

// --- Public Routes ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/:id', getUserById);
router.get('/:id/history', getAthleteTournaments); // Public access to tournament history

// --- General Private Routes ---
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// --- Coach Routes ---
router.get('/coach/student-requests', protect, coach, getStudentRequests);
router.put('/coach/respond-request', protect, coach, handleAthleteRequest);
router.put('/update-athlete/:athleteId', protect, coach, updateAthleteProfileByCoach);

// --- Admin Routes ---
router.get('/', protect, admin, getAllUsers);

module.exports = router;
