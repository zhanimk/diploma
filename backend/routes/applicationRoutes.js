
const express = require('express');
const router = express.Router();

const { 
    createApplication,
    getAllApplications,
    getApplicationById,
    updateApplicationStatus,
    verifyAthleteInApplication,
    getCoachApplications, 
    getAthleteTournaments 
} = require('../controllers/applicationController');

const { protect, coach, athlete, admin } = require('../middleware/authMiddleware');

// --- Админ маршруттары ---
router.route('/')
    .get(protect, admin, getAllApplications) // Админ барлық өтінімді көреді
    .post(protect, coach, createApplication); // Тренер жаңа өтінім жасайды

router.route('/:id')
    .get(protect, admin, getApplicationById); // Админ бір өтінімді ID бойынша көреді

router.route('/:id/status')
    .put(protect, admin, updateApplicationStatus); // Админ статусты жаңартады

router.route('/verify-athlete')
    .put(protect, admin, verifyAthleteInApplication); // Админ спортшыны верификациялайды


// --- Тренер және Спортшы маршруттары ---
router.get('/coach-applications', protect, coach, getCoachApplications);
router.get('/athlete-tournaments', protect, athlete, getAthleteTournaments);


module.exports = router;
