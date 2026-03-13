
const express = require('express');
const router = express.Router();
const {
    createTournament,
    getAllTournaments,
    getAllTournamentsForAdmin,
    getTournamentById,
    updateTournament,
    deleteTournament,
    generateTournamentGrids, // Renamed for clarity
    getTournamentGrids, 
} = require('../controllers/tournamentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/admin').get(protect, admin, getAllTournamentsForAdmin);

router.route('/')
    .post(protect, admin, createTournament)
    .get(getAllTournaments);

router.route('/:id')
    .get(getTournamentById)
    .put(protect, admin, updateTournament)
    .delete(protect, admin, deleteTournament);

// Grid-related routes
router.route('/:id/generate-grids').post(protect, admin, generateTournamentGrids); // Renamed route
router.route('/:id/grids').get(protect, admin, getTournamentGrids); 

module.exports = router;
