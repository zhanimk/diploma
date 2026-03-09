const mongoose = require('mongoose');
const Tournament = require('../models/tournamentModel');
const asyncHandler = require('express-async-handler');

// @desc    Create a new tournament
// @route   POST /api/tournaments
// @access  Private/Admin
const createTournament = asyncHandler(async (req, res) => {
    const {
        name,
        date,
        location,
        registrationDeadline,
        tatamiCount,
        weightCategories,
        ageCategories
    } = req.body;

    if (!name || !date || !location || !registrationDeadline || !tatamiCount || !weightCategories || !ageCategories) {
        res.status(400);
        throw new Error('Please provide all required fields for the tournament');
    }

    const tournament = new Tournament({
        name,
        date,
        location,
        registrationDeadline,
        tatamiCount,
        weightCategories,
        ageCategories,
        organizer: req.user.id,
        status: 'REGISTRATION_OPEN' // Set initial status
    });

    const createdTournament = await tournament.save();
    res.status(201).json(createdTournament);
});

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
const getTournaments = asyncHandler(async (req, res) => {
    const tournaments = await Tournament.find({}).populate('organizer', 'firstName lastName');
    res.json(tournaments);
});

// @desc    Get tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
const getTournamentById = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id)
        .populate('organizer', 'firstName lastName')
        .populate('participants.user', 'firstName lastName')
        .populate('grid.rounds.matches.participant1', 'firstName lastName')
        .populate('grid.rounds.matches.participant2', 'firstName lastName');

    if (tournament) {
        res.json(tournament);
    } else {
        res.status(404);
        throw new Error('Tournament not found');
    }
});

// @desc    Register for a tournament
// @route   POST /api/tournaments/:id/register
// @access  Private/Athlete
const registerForTournament = asyncHandler(async (req, res) => {
    const { weightCategory, ageCategory } = req.body;
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
        res.status(404);
        throw new Error('Tournament not found');
    }

    if (tournament.status !== 'REGISTRATION_OPEN') {
        res.status(400);
        throw new Error('Registration is not open for this tournament');
    }

    if (tournament.participants.some(p => p.user.toString() === req.user.id.toString())) {
        res.status(400);
        throw new Error('You are already registered for this tournament');
    }

    tournament.participants.push({ user: req.user.id, weightCategory, ageCategory });
    await tournament.save();

    const updatedTournament = await Tournament.findById(req.params.id)
        .populate('participants.user', 'firstName lastName');

    res.status(201).json(updatedTournament);
});

// @desc    Generate a tournament grid
// @route   POST /api/tournaments/:id/grid
// @access  Private/Admin
const generateGrid = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id).populate('participants.user', 'firstName lastName');

    if (!tournament) {
        res.status(404); throw new Error('Tournament not found');
    }

    const groupedParticipants = tournament.participants.reduce((acc, p) => {
        const key = `${p.weightCategory}kg-${p.ageCategory}yo`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(p.user);
        return acc;
    }, {});

    const newGrid = Object.keys(groupedParticipants).map(category => {
        let players = [...groupedParticipants[category]].sort(() => 0.5 - Math.random());
        const firstRoundMatches = [];

        for (let i = 0; i < players.length; i += 2) {
            firstRoundMatches.push({
                _id: new mongoose.Types.ObjectId(),
                participant1: players[i],
                participant2: players[i + 1] || null,
                winner: players[i + 1] ? null : players[i]._id,
            });
        }

        return {
            category,
            rounds: [{ matches: firstRoundMatches }],
        };
    });

    tournament.grid = newGrid;
    tournament.status = 'IN_PROGRESS';
    await tournament.save();
    
    res.json(tournament);
});


// @desc    Update match result
// @route   PUT /api/tournaments/:id/grid
// @access  Private/Judge
const updateMatchResult = asyncHandler(async (req, res) => {
    const { category, matchId, winnerId } = req.body;
    const tournament = await Tournament.findById(req.params.id)
        .populate('participants.user', 'firstName lastName')
        .populate('grid.rounds.matches.participant1', 'firstName lastName')
        .populate('grid.rounds.matches.participant2', 'firstName lastName');

    if (!tournament) { res.status(404); throw new Error('Tournament not found'); }

    const categoryGrid = tournament.grid.find(c => c.category === category);
    if (!categoryGrid) { res.status(404); throw new Error('Category not found'); }

    const roundIndex = categoryGrid.rounds.findIndex(r => r.matches.some(m => m._id.toString() === matchId));
    if (roundIndex === -1) { res.status(404); throw new Error('Match not found'); }
    
    const match = categoryGrid.rounds[roundIndex].matches.find(m => m._id.toString() === matchId);
    match.winner = winnerId;

    const currentRound = categoryGrid.rounds[roundIndex];
    if (currentRound.matches.every(m => m.winner)) {
        const winners = currentRound.matches.map(m => m.winner.toString() === m.participant1._id.toString() ? m.participant1 : m.participant2);
        
        if (winners.length > 1) {
            const nextRoundMatches = [];
            for (let i = 0; i < winners.length; i += 2) {
                nextRoundMatches.push({
                    _id: new mongoose.Types.ObjectId(),
                    participant1: winners[i],
                    participant2: winners[i + 1] || null,
                    winner: winners[i + 1] ? null : winners[i]._id,
                });
            }
            if (categoryGrid.rounds.length === roundIndex + 1) {
                 categoryGrid.rounds.push({ matches: nextRoundMatches });
            }
        }
    }

    if (tournament.grid.every(c => c.rounds[c.rounds.length - 1].matches.length === 1 && c.rounds[c.rounds.length - 1].matches[0].winner)) {
        tournament.status = 'COMPLETED';
    }

    tournament.markModified('grid');
    await tournament.save();

    res.json(tournament);
});

module.exports = { createTournament, getTournaments, getTournamentById, registerForTournament, generateGrid, updateMatchResult };
