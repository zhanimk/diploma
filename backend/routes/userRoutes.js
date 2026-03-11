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

// --- General Private Routes (Profile must be before /:id) ---
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// --- Coach Routes ---
router.get('/coach/student-requests', protect, coach, getStudentRequests);
router.put('/update-athlete/:athleteId', protect, coach, updateAthleteProfileByCoach);
router.post('/coach/handle-request', protect, coach, handleAthleteRequest);

// --- Admin Routes ---
router.get('/', protect, admin, getAllUsers);

// --- Public routes that might conflict with others must be last ---
router.get('/:id', getUserById);
router.get('/:id/history', getAthleteTournaments);

module.exports = router;
