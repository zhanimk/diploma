
const express = require('express');
const router = express.Router();

// Импорт всех необходимых контроллеров
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    getCoaches,
    sendRequestToCoach,
    getStudentRequests,
    respondToStudentRequest,
    getMyAthletes,
    removeStudent,
    unlinkCoach,
    getAthleteTournaments,
    updateAthleteProfileByCoach,
    getUserById,
    registerAthleteByCoach // --- ИМПОРТИРУЕМ НОВУЮ ФУНКЦИЮ
} = require('../controllers/userController');

// Импорт всех необходимых middleware
const { protect, admin, coach, athlete } = require('../middleware/authMiddleware');

// --- ОБЩИЕ МАРШРУТЫ ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/coaches', getCoaches);

// --- МАРШРУТЫ ПРОФИЛЯ ---
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.get('/profile/:id', protect, coach, getUserById);

// --- МАРШРУТЫ СПОРТСМЕНА (Athlete) ---
router.post('/athlete/send-request', protect, athlete, sendRequestToCoach);
router.put('/profile/unlink-coach', protect, athlete, unlinkCoach);

// --- МАРШРУТЫ ТРЕНЕРА (Coach) ---
router.post('/coach/register-athlete', protect, coach, registerAthleteByCoach); // --- ДОБАВЛЯЕМ НОВЫЙ МАРШРУТ
router.get('/coach/my-athletes', protect, coach, getMyAthletes);
router.get('/coach/student-requests', protect, coach, getStudentRequests);
router.put('/coach/respond-request', protect, coach, respondToStudentRequest);
router.put('/coach/remove-student', protect, coach, removeStudent);
router.put('/coach/update-athlete/:athleteId', protect, coach, updateAthleteProfileByCoach);

// --- МАРШРУТЫ АДМИНИСТРАТОРА (Admin) ---
router.get('/', protect, admin, getAllUsers);

// --- ПУБЛИЧНЫЙ МАРШРУТ ДЛЯ ПОЛУЧЕНИЯ ДАННЫХ ПО ID ---
router.get('/:id', getUserById);

router.get('/:id/history', getAthleteTournaments);

module.exports = router;
