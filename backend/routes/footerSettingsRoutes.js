const express = require('express');
const router = express.Router();
const { getFooterSettings, updateFooterSettings } = require('../controllers/footerSettingsController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/settings/footer
// @desc    Получить настройки футера
// @access  Public
router.get('/', getFooterSettings);

// @route   PUT /api/settings/footer
// @desc    Обновить настройки футера
// @access  Private/Admin
router.put('/', protect, admin, updateFooterSettings);

module.exports = router;
