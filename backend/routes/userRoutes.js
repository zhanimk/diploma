const express = require('express');
const router = express.Router();

// Импортируем контроллеры
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile, // Импортируем новую функцию
  getAllUsers,
  sendCoachRequest,
  respondToCoachRequest,
  getCoachStudents,
  getAthleteCoach,
  removeStudent,
  getCoachRequests
} = require('../controllers/userController');

// Импортируем middleware для защиты маршрутов
const { protect, coach, athlete } = require('../middleware/authMiddleware');

// --- Маршруты ---

// ... (маршруты register и login без изменений)

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); // Добавляем новый маршрут

// ... (остальные маршруты)

module.exports = router;
