const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   /api/settings

// Получение настроек - доступно всем, так как информация может быть нужна на фронтенде
router.get('/', getSettings);

// Обновление настроек - только для администраторов
router.put('/', protect, admin, updateSettings);

module.exports = router;
