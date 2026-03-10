
const express = require('express');
const router = express.Router();
const {
    createTournament,
    getAllTournaments, // For public
    getAllTournamentsForAdmin, // For Admin
    getTournamentById,
    updateTournament,
    deleteTournament,
} = require('../controllers/tournamentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin-specific route to get ALL tournaments
router.route('/admin').get(protect, admin, getAllTournamentsForAdmin);

// Public routes
router.route('/')
    .post(protect, admin, createTournament) // Create is still admin-only
    .get(getAllTournaments);               // Public GET for REGISTRATION_OPEN tournaments

// Routes by ID
router.route('/:id')
    .get(getTournamentById)                 // Public
    .put(protect, admin, updateTournament)    // Admin only
    .delete(protect, admin, deleteTournament); // Admin only

module.exports = router;
