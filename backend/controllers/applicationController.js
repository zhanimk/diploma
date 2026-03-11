const asyncHandler = require('express-async-handler');
const Application = require('../models/applicationModel');
const Tournament = require('../models/tournamentModel');
const User = require('../models/userModel');

// @desc    Создать новую заявку на турнир
// @route   POST /api/applications
// @access  Private (Coach)
const createApplication = asyncHandler(async (req, res) => {
    const { tournamentId, athleteIds } = req.body;
    const coachId = req.user._id;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
        res.status(404);
        throw new Error('Турнир не найден');
    }

    const existingApplication = await Application.findOne({ tournament: tournamentId, coach: coachId });
    if (existingApplication) {
        res.status(400);
        throw new Error('Вы уже подали заявку на этот турнир');
    }

    const athletes = await User.find({ '_id': { $in: athleteIds }, 'role': 'athlete' });
    if (athletes.length !== athleteIds.length) {
        res.status(404);
        throw new Error('Один или несколько спортсменов не найдены');
    }

    const appliedAthletes = athletes.map(athlete => {
        const birthDate = new Date(athlete.dateOfBirth);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        const category = tournament.categories.find(c => 
            age >= c.ageFrom && 
            age <= c.ageTo && 
            c.gender === athlete.gender
        );

        if (!category) {
            throw new Error(`Для спортсмена ${athlete.firstName} не найдена подходящая возрастная категория.`);
        }
        
        const weightCategory = category.weights.reduce((prev, curr) => {
            return (Math.abs(curr - athlete.weight) < Math.abs(prev - athlete.weight) ? curr : prev);
        });

        return {
            athlete: athlete._id,
            weightCategory: weightCategory,
        };
    });

    const application = new Application({
        tournament: tournamentId,
        coach: coachId,
        athletes: appliedAthletes,
        status: 'PENDING',
    });

    const createdApplication = await application.save();
    res.status(201).json(createdApplication);
});

// @desc    Получить все заявки (для админа)
// @route   GET /api/applications/admin
// @access  Private (Admin)
const getAllApplications = asyncHandler(async (req, res) => {
    const applications = await Application.find({}).populate('tournament', 'name date').populate({
        path: 'coach',
        select: 'user',
        populate: {
            path: 'user',
            select: 'firstName lastName'
        }
    });
    res.json(applications);
});

// @desc    Получить заявку по ID
// @route   GET /api/applications/:id
// @access  Private (Admin)
const getApplicationById = asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.id)
        .populate('tournament', 'name date categories')
        .populate({
            path: 'coach',
            populate: { path: 'user', select: 'firstName lastName email' }
        })
        .populate({
            path: 'athletes.athlete',
            model: 'User',
            select: 'firstName lastName dateOfBirth gender'
        });

    if (application) {
        res.json(application);
    } else {
        res.status(404);
        throw new Error('Заявка не найдена');
    }
});

// @desc    Обновить статус заявки (APPROVED/REJECTED)
// @route   PUT /api/applications/:id/status
// @access  Private (Admin)
const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);

    if (application) {
        if (status === 'APPROVED' || status === 'REJECTED') {
            application.status = status;
            await application.save();
            res.json({ message: `Статус заявки обновлен на ${status}` });
        } else {
            res.status(400);
            throw new Error('Некорректный статус');
        }
    } else {
        res.status(404);
        throw new Error('Заявка не найдена');
    }
});

// @desc    Обновить данные спортсмена в заявке (вес, категория, верификация)
// @route   PUT /api/applications/:id/athlete/:athleteEntryId
// @access  Private (Admin)
const updateAthleteInApplication = asyncHandler(async (req, res) => {
    const { applicationId, athleteEntryId } = req.params;
    const { actualWeight, weightCategory, isVerifiedByAdmin } = req.body;

    const application = await Application.findById(applicationId);

    if (!application) {
        res.status(404);
        throw new Error('Заявка не найдена.');
    }

    const athleteEntry = application.athletes.id(athleteEntryId);

    if (!athleteEntry) {
        res.status(404);
        throw new Error('Спортсмен в этой заявке не найден.');
    }

    // Обновляем только те поля, которые были переданы
    if (actualWeight !== undefined) {
        athleteEntry.actualWeight = actualWeight;
    }
    if (weightCategory !== undefined) {
        athleteEntry.weightCategory = weightCategory;
    }
    if (isVerifiedByAdmin !== undefined) {
        athleteEntry.isVerifiedByAdmin = isVerifiedByAdmin;
    }

    await application.save();

    // Возвращаем обновленную запись о спортсмене для удобства на фронте
    res.json(athleteEntry);
});

// Другие контроллеры (getCoachApplications, getAthleteTournaments и т.д.) остаются без изменений
const getCoachApplications = asyncHandler(async (req, res) => { /* ... */ });
const getAthleteTournaments = asyncHandler(async (req, res) => { /* ... */ });


module.exports = {
    createApplication,
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    updateAthleteInApplication,
    getCoachApplications,
    getAthleteTournaments,
};
