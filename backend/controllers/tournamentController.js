
const asyncHandler = require('express-async-handler');
const Tournament = require('../models/tournamentModel');

// @desc    Create a new tournament
// @route   POST /api/tournaments
// @access  Private/Admin
const createTournament = asyncHandler(async (req, res) => {
    const {
        name, date, location, registrationDeadline, tatamiCount, categories, status, regulationsPdf
    } = req.body;

    if (!name || !date || !location || !registrationDeadline || !tatamiCount || !categories) {
        res.status(400);
        throw new Error('Please fill all required fields: name, date, location, registration deadline, tatami count, and categories');
    }

    const tournament = new Tournament({
        name, date, location, registrationDeadline, tatamiCount, categories,
        status: status || 'PLANNED', // Default to PLANNED if not provided
        regulationsPdf,
        createdBy: req.user._id,
    });

    const createdTournament = await tournament.save();
    res.status(201).json(createdTournament);
});

// @desc    Get all published tournaments for public users
// @route   GET /api/tournaments
// @access  Public
const getAllTournaments = asyncHandler(async (req, res) => {
    // Only show tournaments where registration is open to the public
    const tournaments = await Tournament.find({ status: 'REGISTRATION_OPEN' }).sort({ date: -1 });
    res.json(tournaments);
});

// @desc    Get all tournaments for Admin (includes all statuses)
// @route   GET /api/tournaments/admin
// @access  Private/Admin
const getAllTournamentsForAdmin = asyncHandler(async (req, res) => {
    const tournaments = await Tournament.find({}).sort({ date: -1 });
    res.json(tournaments);
});

// @desc    Get a single tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
const getTournamentById = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);

    if (tournament) {
        res.json(tournament);
    } else {
        res.status(404);
        throw new Error('Tournament not found');
    }
});

// @desc    Update a tournament
// @route   PUT /api/tournaments/:id
// @access  Private/Admin
const updateTournament = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);

    if (tournament) {
        tournament.name = req.body.name || tournament.name;
        tournament.date = req.body.date || tournament.date;
        tournament.location = req.body.location || tournament.location;
        tournament.registrationDeadline = req.body.registrationDeadline || tournament.registrationDeadline;
        tournament.tatamiCount = req.body.tatamiCount || tournament.tatamiCount;
        tournament.categories = req.body.categories || tournament.categories;
        tournament.status = req.body.status || tournament.status;
        tournament.regulationsPdf = req.body.regulationsPdf || tournament.regulationsPdf;

        const updatedTournament = await tournament.save();
        res.json(updatedTournament);
    } else {
        res.status(404);
        throw new Error('Tournament not found');
    }
});

// @desc    Delete a tournament
// @route   DELETE /api/tournaments/:id
// @access  Private/Admin
const deleteTournament = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);

    if (tournament) {
        // In a real app, you might want to check for dependencies before deleting
        await Tournament.deleteOne({ _id: req.params.id });
        res.json({ message: 'Tournament removed' });
    } else {
        res.status(404);
        throw new Error('Tournament not found');
    }
});

module.exports = {
    createTournament,
    getAllTournaments,
    getAllTournamentsForAdmin, // Export the new admin function
    getTournamentById,
    updateTournament,
    deleteTournament,
};
