const express = require('express');
const router = express.Router();
const { 
    createTournament,
    getTournaments,
    getTournamentById,
    registerForTournament,
    generateGrid,
    updateMatchResult
} = require('../controllers/tournamentController');
const { protect, admin, athlete } = require('../middleware/authMiddleware');
const { adminOrJudge } = require('../middleware/adminOrJudge');

// @desc    Create a new tournament and get all tournaments
// @route   POST /api/tournaments and GET /api/tournaments
// @access  Private/Admin for POST, Public for GET
router.route('/')
    .post(protect, admin, createTournament)
    .get(getTournaments);

// @desc    Get tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
router.route('/:id').get(getTournamentById);

// @desc    Register for a tournament
// @route   POST /api/tournaments/:id/register
// @access  Private/Athlete
router.route('/:id/register').post(protect, athlete, registerForTournament);

// @desc    Generate a tournament grid or update match results
// @route   POST /api/tournaments/:id/grid and PUT /api/tournaments/:id/grid
// @access  Private/Admin or Private/Judge
router.route('/:id/grid')
    .post(protect, adminOrJudge, generateGrid)
    .put(protect, adminOrJudge, updateMatchResult);

module.exports = router;
