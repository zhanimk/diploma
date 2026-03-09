const express = require('express');
const router = express.Router();

// Импортируем контроллеры
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getCoaches, // <-- Добавляем новый контроллер
  sendRequestToCoach,       
  getStudentRequests,       
  respondToStudentRequest,    
  getCoachStudents,
  removeStudent,
} = require('../controllers/userController');

// Импортируем middleware для защиты маршрутов
const { protect, coach, athlete, admin } = require('../middleware/authMiddleware');

// --- Основные маршруты ---
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- Маршруты для получения списка тренеров (для всех авторизованных) ---
router.get('/coaches', protect, getCoaches); // <-- Новый маршрут

// --- Профиль ---
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); 

// --- Маршруты для админа ---
router.get('/', protect, admin, getAllUsers); // <-- Уточняем, что это только для админа

// --- Маршруты для спортсмена (Athlete) ---
router.post('/athlete/send-request', protect, athlete, sendRequestToCoach);

// --- Маршруты для тренера (Coach) ---
router.get('/coach/students', protect, coach, getCoachStudents);
router.put('/coach/remove-student', protect, coach, removeStudent);
router.get('/coach/student-requests', protect, coach, getStudentRequests);
router.put('/coach/respond-request', protect, coach, respondToStudentRequest);

module.exports = router;
