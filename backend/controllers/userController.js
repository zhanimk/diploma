
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Tournament = require('../models/tournamentModel');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    // --- ИСПРАВЛЕНИЕ: Добавлены `gender` и `weight` в деструктуризацию
    const { firstName, lastName, email, password, role, gender, weight, phoneNumber, dateOfBirth, city, club } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('Пайдаланушы бұл email-мен тіркелген');
    }

    // --- ИСПРАВЛЕНИЕ: Передаем `gender` и `weight` в создание пользователя
    const userObject = {
        firstName, 
        lastName, 
        email, 
        password, 
        role, 
        gender, 
        phoneNumber, 
        dateOfBirth, 
        city, 
        club
    };

    // Добавляем вес, только если роль 'athlete' и вес предоставлен
    if (role === 'athlete' && weight) {
        userObject.weight = weight;
    }

    const user = await User.create(userObject);

    if (user) {
        // Возвращаем полный профиль, как в login
        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            coach: user.coach,
            gender: user.gender,
            weight: user.weight,
            dateOfBirth: user.dateOfBirth,
            club: user.club,
            city: user.city,
            phoneNumber: user.phoneNumber,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Пайдаланушы деректері жарамсыз');
    }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            coach: user.coach,
            gender: user.gender,
            weight: user.weight,
            dateOfBirth: user.dateOfBirth,
            club: user.club,
            city: user.city,
            phoneNumber: user.phoneNumber,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Email немесе құпия сөз қате');
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('Пайдаланушы табылмады');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            dateOfBirth,
            club,
            city,
            gender,
            weight,
            password
        } = req.body;

        // Проверка на уникальность нового email
        if (email && email !== user.email) {
            const userExists = await User.findOne({ email });
            if (userExists) {
                res.status(400);
                throw new Error('Бұл email басқа аккаунтта қолданылуда.');
            }
            user.email = email;
        }

        // Обновляем поля, только если они были переданы в запросе
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
        if (dateOfBirth !== undefined) {
            // Принимаем null для очистки даты
            user.dateOfBirth = dateOfBirth || null;
        }
        if (club !== undefined) user.club = club;
        if (city !== undefined) user.city = city;
        if (gender !== undefined) user.gender = gender;

        // Особая обработка для поля 'weight' у спортсменов
        if (user.role === 'athlete') {
            if (weight !== undefined) {
                // Позволяем установить null или числовое значение
                user.weight = weight === '' || weight === null ? null : Number(weight);
            }
        }

        // Обновление пароля, если он был передан
        if (password) {
            user.password = password;
        }

        const updatedUser = await user.save();

        // Возвращаем обновленные данные пользователя
        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role,
            coach: updatedUser.coach,
            gender: updatedUser.gender,
            weight: updatedUser.weight,
            dateOfBirth: updatedUser.dateOfBirth,
            club: updatedUser.club,
            city: updatedUser.city,
            phoneNumber: updatedUser.phoneNumber,
            token: generateToken(updatedUser._id), // Перевыпускаем токен, если нужна новая информация
        });

    } else {
        res.status(404);
        throw new Error('Пайдаланушы табылмады');
    }
});

// @desc    Get all users (for admin)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});


// @desc    Get all coaches
// @route   GET /api/users/coaches
// @access  Public (for athletes to find a coach)
const getCoaches = asyncHandler(async (req, res) => {
    const coaches = await User.find({ role: 'coach' }).select('-password');
    res.json(coaches);
});

// @desc    Get user by ID (public data)
// @route   GET /api/users/:id
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('Пайдаланушы табылмады');
    }
});

// @desc    Athlete sends a request to a coach
// @route   POST /api/users/coach/send-request
// @access  Private/Athlete
const sendRequestToCoach = asyncHandler(async (req, res) => {
    const { coachId } = req.body;
    const athleteId = req.user._id;

    const coach = await User.findById(coachId);
    const athlete = await User.findById(athleteId);

    if (!coach || coach.role !== 'coach') {
        res.status(404);
        throw new Error('Жаттықтырушы табылмады');
    }
    
    if (athlete.coach) {
        res.status(400);
        throw new Error('Сіздің жаттықтырушыңыз бар');
    }

    const existingRequest = coach.studentRequests.find(r => r.student.toString() === athleteId.toString());
    if (existingRequest) {
        res.status(400);
        throw new Error('Сіз бұл жаттықтырушыға сұраныс жіберіп қойғансыз');
    }

    coach.studentRequests.push({ student: athleteId, status: 'pending' });
    await coach.save();

    res.status(200).json({ message: 'Сұраныс сәтті жіберілді' });
});


// @desc    Coach gets their student requests
// @route   GET /api/users/coach/requests
// @access  Private/Coach
const getStudentRequests = asyncHandler(async (req, res) => {
    const coach = await User.findById(req.user._id).populate('studentRequests.student', 'firstName lastName email');
    res.json(coach.studentRequests);
});

// @desc    Coach responds to a student request
// @route   PUT /api/users/coach/respond-request
// @access  Private/Coach
const respondToStudentRequest = asyncHandler(async (req, res) => {
    const { requestId, status } = req.body;
    const coachId = req.user._id;

    const coach = await User.findById(coachId);
    const request = coach.studentRequests.id(requestId);

    if (!request) {
        res.status(404);
        throw new Error('Сұраныс табылмады');
    }

    const athlete = await User.findById(request.student);

    if (status === 'accepted') {
        athlete.coach = coachId;
        coach.students.push(athlete._id);
        request.status = 'accepted';
        await athlete.save();
    } else { 
        request.status = 'rejected';
    }
    
    await coach.save();
    res.json({ message: 'Жауап сәтті сақталды' });
});


// @desc    Get all athletes for a coach
// @route   GET /api/users/coach/my-athletes
// @access  Private/Coach
const getMyAthletes = asyncHandler(async (req, res) => {
    const coachId = req.user._id;
    const athletes = await User.find({ coach: coachId }).select('-password');
    res.json(athletes);
});

// @desc    Unlink an athlete from a coach
// @route   PUT /api/users/coach/remove-student
// @access  Private/Coach
const removeStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.body;
    const coachId = req.user._id;

    const student = await User.findById(studentId);

    if (!student || !student.coach || student.coach.toString() !== coachId.toString()) {
        res.status(400);
        throw new Error('Спортшы сіздің командада емес');
    }

    student.coach = null;
    await student.save();

    const coach = await User.findById(coachId);
    coach.students.pull(studentId);
    await coach.save();

    res.json({ message: 'Спортшы сәтті өшірілді' });
});

// @desc    Athlete unlinks from their coach
// @route   PUT /api/users/profile/unlink-coach
// @access  Private/Athlete
const unlinkCoach = asyncHandler(async (req, res) => {
    const athlete = await User.findById(req.user._id);
    if (athlete.coach) {
        const coach = await User.findById(athlete.coach);
        if (coach) {
            coach.students.pull(athlete._id);
            await coach.save();
        }
        athlete.coach = null;
        const updatedAthlete = await athlete.save();
        res.json(updatedAthlete);
    } else {
        res.status(400).send({ message: 'Сіздің жаттықтырушыңыз жоқ' });
    }
});


// @desc    Get athlete's tournament history
// @route   GET /api/users/:id/history
// @access  Public
const getAthleteTournaments = asyncHandler(async (req, res) => {
    const athleteId = req.params.id;
    const tournaments = await Tournament.find({ 'participants.athlete': athleteId })
        .populate('participants.athlete', 'firstName lastName');

    const history = tournaments.map(tourn => {
        const participantInfo = tourn.participants.find(p => p.athlete._id.toString() === athleteId);
        return {
            tournamentName: tourn.name,
            date: tourn.date,
            result: participantInfo ? participantInfo.status : ' белгісіз',
            fights: 10, // Placeholder
            wins: 7, // Placeholder
        };
    });

    res.json(history);
});


// @desc    Update athlete profile by their coach
// @route   PUT /api/users/coach/update-athlete/:athleteId
// @access  Private/Coach
const updateAthleteProfileByCoach = asyncHandler(async (req, res) => {
    const { athleteId } = req.params;
    const coachId = req.user._id;

    const athlete = await User.findById(athleteId);

    if (!athlete || !athlete.coach || athlete.coach.toString() !== coachId.toString()) {
        res.status(404);
        throw new Error('Спортсмен не найден или не числится в вашей команде.');
    }

    athlete.firstName = req.body.firstName || athlete.firstName;
    athlete.lastName = req.body.lastName || athlete.lastName;
    athlete.phoneNumber = req.body.phoneNumber || athlete.phoneNumber;
    athlete.dateOfBirth = req.body.dateOfBirth || athlete.dateOfBirth;
    athlete.club = req.body.club || athlete.club;
    athlete.city = req.body.city || athlete.city;

    const updatedAthlete = await athlete.save();

    res.json({
        _id: updatedAthlete._id,
        firstName: updatedAthlete.firstName,
        lastName: updatedAthlete.lastName,
        email: updatedAthlete.email,
        role: updatedAthlete.role
    });
});

// @desc    Register an athlete and assign to the coach
// @route   POST /api/users/coach/register-athlete
// @access  Private/Coach
const registerAthleteByCoach = asyncHandler(async (req, res) => {
    const coachId = req.user._id;
    const {
        firstName,
        lastName,
        email,
        password,
        gender,
        weight,
        dateOfBirth,
        city,
        club,
        phoneNumber
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Спортсмен с таким email уже зарегистрирован.');
    }

    const athlete = await User.create({
        firstName,
        lastName,
        email,
        password,
        gender,
        weight,
        dateOfBirth,
        city,
        club,
        phoneNumber,
        role: 'athlete',
        coach: coachId, // Automatically assign to the logged-in coach
    });

    if (athlete) {
        // Add the new athlete to the coach's list of students
        const coach = await User.findById(coachId);
        coach.students.push(athlete._id);
        await coach.save();

        res.status(201).json({
            _id: athlete._id,
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            email: athlete.email,
            role: athlete.role,
            coach: athlete.coach,
        });
    } else {
        res.status(400);
        throw new Error('Неверные данные спортсмена.');
    }
});



module.exports = {
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
  getAthleteTournaments,
  updateAthleteProfileByCoach,
  unlinkCoach,
  getUserById,
  registerAthleteByCoach, // --- ЭКСПОРТИРУЕМ НОВУЮ ФУНКЦИЮ
};
