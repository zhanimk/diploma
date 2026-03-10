
const asyncHandler = require('express-async-handler');
const Application = require('../models/applicationModel');
const Tournament = require('../models/tournamentModel'); 
const User = require('../models/userModel');


// @desc    Create a new application
// @route   POST /api/applications
// @access  Private/Coach
const createApplication = asyncHandler(async (req, res) => {
    const { tournamentId, athleteEntries } = req.body;
    const coachId = req.user._id;

    if (!tournamentId || !athleteEntries || athleteEntries.length === 0) {
        res.status(400);
        throw new Error('Маңызды деректер жоқ: турнир ID, спортшылар тізімі');
    }

    const application = new Application({
        coach: coachId,
        tournament: tournamentId,
        athletes: athleteEntries,
        status: 'PENDING', // Статус по умолчанию
    });

    const createdApplication = await application.save();
    res.status(201).json(createdApplication);
});


// @desc    Get all applications (for Admin)
// @route   GET /api/applications
// @access  Private/Admin
const getAllApplications = asyncHandler(async (req, res) => {
    const applications = await Application.find({})
        .populate('tournament', 'name date')
        .populate({
            path: 'coach',
            select: 'user teamName',
            populate: {
                path: 'user',
                select: 'firstName lastName email'
            }
        })
        .sort({ createdAt: -1 });
    res.json(applications);
});


// @desc    Get a single application by ID (for Admin)
// @route   GET /api/applications/:id
// @access  Private/Admin
const getApplicationById = asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.id)
        .populate('tournament', 'name date')
        .populate({
             path: 'coach',
             select: 'user teamName',
             populate: { path: 'user', select: 'firstName lastName email' }
        })
        .populate({
            path: 'athletes.athlete',
            model: 'User',
            select: 'user dateOfBirth',
             populate: { path: 'user', select: 'firstName lastName' }
        })
        .populate('athletes.ageCategory', 'name')
        .populate('athletes.weightCategory', 'weight');

    if (application) {
        res.json(application);
    } else {
        res.status(404);
        throw new Error('Өтінім табылмады');
    }
});

// @desc    Update application status (for Admin)
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);

    if (!['APPROVED', 'REJECTED'].includes(status)) {
         res.status(400);
         throw new Error('Жарамсыз статус');
    }

    if (application) {
        application.status = status;
        const updatedApplication = await application.save();
        res.json(updatedApplication);
    } else {
        res.status(404);
        throw new Error('Өтінім табылмады');
    }
});

// @desc    Verify a single athlete in an application (for Admin)
// @route   PUT /api/applications/verify-athlete
// @access  Private/Admin
const verifyAthleteInApplication = asyncHandler(async (req, res) => {
    const { applicationId, athleteEntryId, isVerified } = req.body;

    const application = await Application.findById(applicationId);

    if (application) {
        const athleteEntry = application.athletes.id(athleteEntryId);
        if (athleteEntry) {
            athleteEntry.isVerifiedByAdmin = isVerified;
            await application.save();
            res.json({ message: 'Спортшы статусы жаңартылды' });
        } else {
            res.status(404);
            throw new Error('Өтінімдегі спортшы жазбасы табылмады');
        }
    } else {
        res.status(404);
        throw new Error('Өтінім табылмады');
    }
});


// Қалған ескі функциялар (өзгеріссіз)
const getCoachApplications = asyncHandler(async (req, res) => {
    const coachId = req.user._id;
    const athletes = await User.find({ coach: coachId });
    const athleteIds = athletes.map(athlete => athlete._id);
    const applications = await Application.find({ athletes: { $in: athleteIds } }).populate('tournament', 'name date location');
    res.json(applications);
});

const getAthleteTournaments = asyncHandler(async (req, res) => {
    const athleteId = req.user._id;
    const applications = await Application.find({ athletes: athleteId }).sort({ 'tournament.date': -1 }).populate('tournament', 'name date location');
    if (!applications) {
        res.status(404);
        throw new Error('Для этого спортсмена не найдено заявок.');
    }
    res.json(applications);
});

module.exports = {
    createApplication,
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    verifyAthleteInApplication,
    getCoachApplications,
    getAthleteTournaments,
};
