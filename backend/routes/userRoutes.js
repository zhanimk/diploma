const express = require('express');
const router = express.Router();

// Импортируем контроллеры
const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers
} = require('../controllers/userController');

// Импортируем middleware для защиты маршрутов
const { protect } = require('../middleware/authMiddleware');

// --- Маршруты ---

// @route   POST /api/users/register
// @desc    Регистрация нового пользователя
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Аутентификация пользователя и получение токена
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/users/profile
// @desc    Получение профиля залогиненного пользователя
// @access  Private (защищено токеном)
router.get('/profile', protect, getUserProfile);

// @route   GET /api/users
// @desc    Получение всех пользователей (для примера, можно сделать приватным для админа)
// @access  Public (в данном случае, лучше сделать protect)
router.get('/', getAllUsers);


module.exports = router;
