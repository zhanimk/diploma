const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    blockUser, // <-- Импортируем функцию блокировки
    updateAthleteProfileByCoach,
    getAthleteTournaments,
    getStudentRequests,
    handleAthleteRequest
} = require('../controllers/userController');
const { protect, admin, coach } = require('../middleware/authMiddleware');

// --- Public Routes ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- General Private Routes ---
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

// --- Coach Routes ---
router.get('/coach/student-requests', protect, coach, getStudentRequests);
router.put('/update-athlete/:athleteId', protect, coach, updateAthleteProfileByCoach);
router.post('/coach/handle-request', protect, coach, handleAthleteRequest);

// --- Admin Routes ---
router.route('/')
    .get(protect, admin, getAllUsers);

// Новый маршрут для блокировки пользователя
router.route('/:id/block')
    .put(protect, admin, blockUser);

router.route('/:id')
    .get(getUserById)
    .put(protect, admin, updateUser)
    .delete(protect, admin, deleteUser);

// --- Athlete-specific public routes ---
router.get('/:id/history', getAthleteTournaments);

module.exports = router;
