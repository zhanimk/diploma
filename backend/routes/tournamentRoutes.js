
const express = require('express');
const router = express.Router();
const {
    createTournament,
    getAllTournaments,
    getAllTournamentsForAdmin,
    getTournamentById,
    updateTournament,
    deleteTournament,
    generateTournamentGrid,
    getTournamentGrids, // Наш новый контроллер
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
router.route('/:id/generate-grid').post(protect, admin, generateTournamentGrid);
router.route('/:id/grids').get(protect, admin, getTournamentGrids); // Новый роут для получения сеток

module.exports = router;
