const express = require('express');
const router = express.Router();
const {
    getUserNotifications,
    markPersonalAsRead,
    createGlobalNotification,
    getGlobalNotifications,
    getGlobalNotificationById,
    updateGlobalNotification,
    deleteGlobalNotification,
} = require('../controllers/notificationController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// Роуты для конечного пользователя
router.route('/')
    .get(protect, getUserNotifications);

router.route('/read')
    .put(protect, markPersonalAsRead);

// Роуты для админа (глобальные уведомления)
router.route('/global')
    .post(protect, admin, createGlobalNotification)
    .get(protect, admin, getGlobalNotifications);

router.route('/global/:id')
    .get(getGlobalNotificationById) // Можно сделать публичным для чтения
    .put(protect, admin, updateGlobalNotification)
    .delete(protect, admin, deleteGlobalNotification);

module.exports = router;
