const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Генерация JWT токена
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Регистрация нового пользователя
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, role, phoneNumber, dateOfBirth, club, city } = req.body;

    try {
        // 1. Проверяем, существует ли пользователь
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400); // Bad Request
            throw new Error('Пользователь с таким email уже существует');
        }

        // 2. Хешируем пароль
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Создаем пользователя
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role || 'athlete', // По умолчанию роль - атлет
            phoneNumber,
            dateOfBirth,
            club,
            city
        });

        // 4. Отвечаем данными пользователя и токеном
        if (user) {
            res.status(201).json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Неверные данные пользователя');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};

// @desc    Аутентификация пользователя (логин)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Ищем пользователя по email
        const user = await User.findOne({ email });

        // 2. Если пользователь найден и пароли совпадают
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401); // Unauthorized
            throw new Error('Неверный email или пароль');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};


// @desc    Получить профиль пользователя
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    // req.user создается в middleware/authMiddleware.js
    const user = await User.findById(req.user.id).select('-password'); 

    if (user) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404);
        throw new Error('Пользователь не найден');
    }
};


// @desc    Получить всех пользователей (для админа)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, getAllUsers };
