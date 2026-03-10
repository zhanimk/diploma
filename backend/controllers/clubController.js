const Club = require('../models/clubModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

// @desc    Create a new club
// @route   POST /api/clubs
// @access  Private/Coach
const createClub = asyncHandler(async (req, res) => {
    const { name, city, logo } = req.body;

    if (!name || !city) {
        res.status(400);
        throw new Error('Please provide all required fields: name, city');
    }

    const existingClub = await Club.findOne({ coach: req.user._id });
    if (existingClub) {
        res.status(400);
        throw new Error('You have already created a club.');
    }

    const club = new Club({
        name,
        city,
        logo, // Добавлено сохранение логотипа при создании
        coach: req.user._id,
    });

    const createdClub = await club.save();
    
    // Также обновим пользователя, чтобы он содержал ссылку на клуб
    await User.findByIdAndUpdate(req.user._id, { club: createdClub._id });

    res.status(201).json(createdClub);
});

// @desc    Get all clubs for public listing
// @route   GET /api/clubs
// @access  Public
const getClubs = asyncHandler(async (req, res) => {
    const clubs = await Club.find({ coach: { $exists: true, $ne: null } });
    res.json(clubs);
});

// @desc    Get the coach's own club and pending athletes
// @route   GET /api/clubs/my-club
// @access  Private/Coach
const getMyClub = asyncHandler(async (req, res) => {
    const club = await Club.findOne({ coach: req.user._id });
    if (!club) {
        // Это не ошибка, просто у тренера еще нет клуба.
        // Отправляем null, клиент решит, что показать.
        return res.json(null); 
    }

    const pendingAthletes = await User.find({
        club: club._id,
        clubStatus: 'pending',
    }).select('-password');

    res.json({
        club,
        pendingAthletes,
    });
});

// @desc    Update the coach's own club details
// @route   PUT /api/clubs/my-club
// @access  Private/Coach
const updateMyClub = asyncHandler(async (req, res) => {
    const { name, city, logo } = req.body; // Получаем все поля

    const club = await Club.findOne({ coach: req.user._id });

    if (!club) {
        res.status(404);
        throw new Error('Клуб не найден. Вы не можете редактировать клуб, которого не существует.');
    }

    // Обновляем все поля
    club.name = name || club.name;
    club.city = city || club.city;
    club.logo = logo; // Обновляем логотип (может быть и пустой строкой)

    const updatedClub = await club.save();

    res.json(updatedClub);
});


// @desc    Get all approved athletes for a coach's club
// @route   GET /api/clubs/my-athletes
// @access  Private/Coach
const getMyAthletes = asyncHandler(async (req, res) => {
    const club = await Club.findOne({ coach: req.user._id });
    if (!club) {
        res.status(404);
        throw new Error('You do not manage a club.');
    }

    const athletes = await User.find({
        club: club._id,
        clubStatus: 'approved'
    }).select('-password');
    
    res.json(athletes);
});

// @desc    Respond to an athlete's club joining request
// @route   PUT /api/clubs/respond-request
// @access  Private/Coach
const respondToRequest = asyncHandler(async (req, res) => {
    const { athleteId, status } = req.body; 

    if (!athleteId || !status || !['approved', 'rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid input data.');
    }

    const club = await Club.findOne({ coach: req.user._id });
    if (!club) {
        res.status(404);
        throw new Error('You do not manage a club.');
    }

    const athlete = await User.findById(athleteId);

    if (!athlete || !athlete.club || !athlete.club.equals(club._id) || athlete.clubStatus !== 'pending') {
        res.status(404);
        throw new Error('Athlete not found or request is not pending for this club.');
    }

    if (status === 'rejected') {
        athlete.club = undefined;
        athlete.clubStatus = 'none';
    } else {
        athlete.clubStatus = status;
    }
    
    await athlete.save();

    res.json({ message: `Athlete request has been ${status}.` });
});

// @desc    Register a new athlete by a coach
// @route   POST /api/clubs/register-athlete
// @access  Private/Coach
const registerAthleteByCoach = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, gender, dateOfBirth, city, rank } = req.body;

    const club = await Club.findOne({ coach: req.user._id });
    if (!club) {
        res.status(403);
        throw new Error('You are not authorized to perform this action because you do not have a club.');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists.');
    }

    const athlete = await User.create({
        firstName, lastName, email, password, gender, dateOfBirth, city, rank,
        role: 'athlete',
        club: club._id,
        clubStatus: 'approved',
    });

    res.status(201).json({
        _id: athlete._id,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        email: athlete.email,
        role: athlete.role,
    });
});

module.exports = {
    createClub,
    getClubs,
    getMyClub,
    updateMyClub,
    getMyAthletes,
    respondToRequest,
    registerAthleteByCoach,
};
