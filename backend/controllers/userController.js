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
    const { firstName, lastName, email, password, role, phoneNumber, dateOfBirth, city, club } = req.body;

    try {
        // Проверка на обязательные поля
        if (!firstName || !lastName || !email || !password || !role) {
            res.status(400); 
            throw new Error('Пожалуйста, заполните все обязательные поля: имя, фамилия, email, пароль и роль.');
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('Пользователь с таким email уже существует');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            phoneNumber,
            dateOfBirth,
            city,
            club
        });

        if (user) {
            // ИСПРАВЛЕНО: Возвращаем полный объект пользователя
            res.status(201).json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                dateOfBirth: user.dateOfBirth,
                club: user.club,
                city: user.city,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Неверные данные пользователя, не удалось создать пользователя');
        }
    } catch (error) {
        console.error('ОШИБКА ПРИ РЕГИСТРАЦИИ:', error); 
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};

// @desc    Аутентификация пользователя (логин)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).populate('coach');

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                dateOfBirth: user.dateOfBirth,
                club: user.club,
                city: user.city,
                coach: user.coach,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Неверный email или пароль');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};


// @desc    Получение профиля пользователя
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        // req.user добавляется в middleware protect
        const user = await User.findById(req.user.id).select('-password').populate('coach');
        if (user) {
            res.json(user);
        } else {
            res.status(404);
            throw new Error('Пользователь не найден');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};


// @desc    Обновление профиля пользователя
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.email = req.body.email || user.email;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
            user.club = req.body.club || user.club;
            user.city = req.body.city || user.city;

            // Если пароль тоже меняется
            if (req.body.password) {
                 const salt = await bcrypt.genSalt(10);
                 user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                role: updatedUser.role,
                phoneNumber: updatedUser.phoneNumber,
                dateOfBirth: updatedUser.dateOfBirth,
                club: updatedUser.club,
                city: updatedUser.city,
                coach: updatedUser.coach,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404);
            throw new Error('Пользователь не найден');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};

// @desc    Получить всех пользователей (для тренера)
// @route   GET /api/users
// @access  Private/Coach
const getAllUsers = async (req, res) => {
    try {
        // Находим всех пользователей с ролью 'athlete' и у которых нет тренера
        const athletes = await User.find({ role: 'athlete', coach: { $exists: false } });
        res.json(athletes);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка на сервере' });
    }
};

// @desc    Тренер отправляет запрос спортсмену
// @route   POST /api/users/coach/send-request
// @access  Private/Coach
const sendCoachRequest = async (req, res) => {
    const { athleteId } = req.body;
    const coachId = req.user._id; // ID тренера из токена

    try {
        const athlete = await User.findById(athleteId);
        if (!athlete) {
            return res.status(404).json({ message: "Спортсмен не найден" });
        }

        // Проверяем, нет ли уже такого запроса
        if (athlete.coachRequests.some(req => req.coach.toString() === coachId.toString())) {
            return res.status(400).json({ message: "Запрос уже отправлен" });
        }
        
        athlete.coachRequests.push({ coach: coachId });
        await athlete.save();

        res.status(200).json({ message: "Запрос успешно отправлен" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка на сервере" });
    }
};

// @desc    Спортсмен отвечает на запрос тренера
// @route   PUT /api/users/athlete/respond-coach
// @access  Private/Athlete
const respondToCoachRequest = async (req, res) => {
    const { coachId, accept } = req.body;
    const athleteId = req.user._id;

    try {
        const athlete = await User.findById(athleteId);
        if (!athlete) {
            return res.status(404).json({ message: "Спортсмен не найден" });
        }

        const request = athlete.coachRequests.find(r => r.coach.toString() === coachId);
        if (!request) {
            return res.status(404).json({ message: "Запрос не найден" });
        }

        if (accept) {
            athlete.coach = coachId;
            athlete.coachRequests = []; // Удаляем все запросы после принятия одного
        } else {
            // Просто удаляем конкретный запрос
            athlete.coachRequests = athlete.coachRequests.filter(r => r.coach.toString() !== coachId);
        }

        await athlete.save();
        const updatedProfile = await User.findById(athleteId).populate('coach');

        res.status(200).json(updatedProfile);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка на сервере" });
    }
};


// @desc    Получить учеников тренера
// @route   GET /api/users/coach/students
// @access  Private/Coach
const getCoachStudents = async (req, res) => {
    try {
        const students = await User.find({ coach: req.user._id });
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Ошибка на сервере' });
    }
};

// @desc    Спортсмен получает своего тренера
// @route   GET /api/users/athlete/coach
// @access  Private/Athlete
const getAthleteCoach = async (req, res) => {
    try {
        const athlete = await User.findById(req.user._id).populate('coach', 'firstName lastName email');
        if (athlete && athlete.coach) {
            res.json(athlete.coach);
        } else {
            res.status(404).json({ message: 'Тренер не найден' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка на сервере' });
    }
};

// @desc    Тренер удаляет ученика
// @route   PUT /api/users/coach/remove-student
// @access  Private/Coach
const removeStudent = async (req, res) => {
    const { studentId } = req.body;
    try {
        const student = await User.findById(studentId);
        if (student && student.coach.toString() === req.user._id.toString()) {
            student.coach = undefined; // Или null
            await student.save();
            res.json({ message: "Студент удален" });
        } else {
            res.status(404).json({ message: "Студент не найден или не принадлежит этому тренеру" });
        }
    } catch (error) {
        res.status(500).json({ message: "Ошибка на сервере" });
    }
};

// @desc    Спортсмен получает запросы от тренеров
// @route   GET /api/users/athlete/coach-requests
// @access  Private/Athlete
const getCoachRequests = async (req, res) => {
    try {
        const athlete = await User.findById(req.user._id).populate('coachRequests.coach', 'firstName lastName email');
        res.json(athlete.coachRequests);
    } catch (error) {
        res.status(500).json({ message: "Ошибка на сервере" });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile,
    getAllUsers, 
    sendCoachRequest, 
    respondToCoachRequest, 
    getCoachStudents, 
    getAthleteCoach,
    removeStudent, 
    getCoachRequests
};