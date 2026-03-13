const asyncHandler = require('express-async-handler');
const Setting = require('../models/settingModel');

// @desc    Получить настройки сайта
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
    // Находим единственный документ с настройками. Если его нет, создаем с дефолтными значениями.
    let settings = await Setting.findOne({ key: 'siteSettings' });
    if (!settings) {
        settings = await Setting.create({ key: 'siteSettings' });
    }
    res.status(200).json(settings);
});

// @desc    Обновить настройки сайта
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
    // Находим документ. Если его нет, он будет создан.
    const settings = await Setting.findOneAndUpdate(
        { key: 'siteSettings' }, // Условие поиска
        { $set: req.body }, // Устанавливаем новые данные из тела запроса
        { new: true, upsert: true, runValidators: true } // Опции:
        // new: true - вернуть обновленный документ
        // upsert: true - создать документ, если он не найден
        // runValidators: true - применить валидацию из схемы
    );

    res.status(200).json(settings);
});

module.exports = { getSettings, updateSettings };
