const asyncHandler = require('express-async-handler');
const Notification = require('../models/notificationModel');

// ===================================================================================
// Функции для конечных пользователей (Users)
// ===================================================================================

// @desc    Получить все уведомления для пользователя (персональные + глобальные)
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = asyncHandler(async (req, res) => {
    // Находим персональные уведомления пользователя
    const userNotifications = Notification.find({ user: req.user._id, isGlobal: false });
    
    // Находим все опубликованные глобальные уведомления
    const globalNotifications = Notification.find({ isGlobal: true, status: 'published' });

    const [userResults, globalResults] = await Promise.all([userNotifications, globalNotifications]);

    // Объединяем, сортируем по дате создания (новые сверху) и отдаем
    const allNotifications = [...userResults, ...globalResults]
        .sort((a, b) => b.createdAt - a.createdAt) 
        .slice(0, 50); // Ограничим до 50 на всякий случай

    res.json(allNotifications);
});

// @desc    Отметить все персональные уведомления как прочитанные
// @route   PUT /api/notifications/read
// @access  Private
const markPersonalAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, read: false, isGlobal: false },
        { $set: { read: true } }
    );
    res.status(2.00).json({ message: 'All notifications marked as read' });
});

// ===================================================================================
// Функции для Администратора (Admin)
// ===================================================================================

// @desc    Создать глобальное уведомление (новость)
// @route   POST /api/notifications/global
// @access  Private/Admin
const createGlobalNotification = asyncHandler(async (req, res) => {
    const { title, content, status } = req.body;

    if (!title || !content) {
        res.status(400);
        throw new Error('Необходимо указать заголовок и содержание');
    }

    const notification = new Notification({
        title,
        content,
        status,
        author: req.user._id,
        isGlobal: true,
    });

    const createdNotification = await notification.save();
    res.status(201).json(createdNotification);
});

// @desc    Получить все глобальные уведомления (для админки)
// @route   GET /api/notifications/global
// @access  Private/Admin
const getGlobalNotifications = asyncHandler(async (req, res) => {
    // Получаем все, включая черновики, для админ-панели
    const notifications = await Notification.find({ isGlobal: true })
        .populate('author', 'name')
        .sort({ createdAt: -1 });
    res.json(notifications);
});

// @desc    Получить глобальное уведомление по ID
// @route   GET /api/notifications/global/:id
// @access  Public (или Private/Admin, если нужно скрыть)
const getGlobalNotificationById = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id).populate('author', 'name');

    if (notification && notification.isGlobal) {
        res.json(notification);
    } else {
        res.status(404);
        throw new Error('Уведомление не найдено');
    }
});

// @desc    Обновить глобальное уведомление
// @route   PUT /api/notifications/global/:id
// @access  Private/Admin
const updateGlobalNotification = asyncHandler(async (req, res) => {
    const { title, content, status } = req.body;
    const notification = await Notification.findById(req.params.id);

    if (notification && notification.isGlobal) {
        notification.title = title || notification.title;
        notification.content = content || notification.content;
        notification.status = status || notification.status;

        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } else {
        res.status(404);
        throw new Error('Уведомление не найдено');
    }
});

// @desc    Удалить глобальное уведомление
// @route   DELETE /api/notifications/global/:id
// @access  Private/Admin
const deleteGlobalNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification && notification.isGlobal) {
        await notification.remove();
        res.json({ message: 'Уведомление удалено' });
    } else {
        res.status(404);
        throw new Error('Уведомление не найдено');
    }
});

module.exports = {
    getUserNotifications,
    markPersonalAsRead,
    createGlobalNotification,
    getGlobalNotifications,
    getGlobalNotificationById,
    updateGlobalNotification,
    deleteGlobalNotification,
};
