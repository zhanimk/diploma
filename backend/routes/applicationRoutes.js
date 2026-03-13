const express = require('express');
const router = express.Router();

const { 
    createApplication,
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    updateAthleteInApplication, // <-- Импортируем новую функцию
    getCoachApplications, 
    getAthleteTournaments,
    getApplicationsByTournament // <-- Наша новая функция
} = require('../controllers/applicationController');

const { protect, coach, admin } = require('../middleware/authMiddleware');

// --- Маршруты для Тренера ---
router.route('/').post(protect, coach, createApplication); // Тренер создает новую заявку
router.get('/coach', protect, coach, getCoachApplications); // Тренер просматривает свои заявки

// --- Маршруты для Спортсмена ---
router.get('/athlete', protect, getAthleteTournaments); // Спортсмен видит свои турниры

// --- Маршруты для Админа ---
router.route('/admin').get(protect, admin, getAllApplications); // Админ видит все заявки
router.route('/tournament/:tournamentId').get(protect, admin, getApplicationsByTournament); // <-- Наш новый маршрут
router.route('/:id').get(protect, admin, getApplicationById); // Админ видит заявку по ID
router.route('/:id/status').put(protect, admin, updateApplicationStatus); // Админ обновляет статус заявки

// Новый маршрут для обновления данных спортсмена в заявке (взвешивание)
router.route('/:id/athlete/:athleteEntryId').put(protect, admin, updateAthleteInApplication);

module.exports = router;
