const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // --- Поля для персональных уведомлений ---
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Не обязательно, если это глобальное уведомление
    },
    message: {
        type: String,
        required: false, // Не обязательно для глобальных уведомлений
    },
    link: {
        type: String, // Может быть ссылка на турнир, заявку и т.д.
    },
    read: {
        type: Boolean,
        default: false,
    },

    // --- Поля для глобальных "Новостей-Уведомлений" ---
    title: {
        type: String, // Заголовок новости/объявления
    },
    content: {
        type: String, // Полный текст новости/объявления
    },
    status: {
        type: String,
        enum: ['published', 'draft'],
        default: 'published',
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Администратор, создавший новость
    },
    
    // --- Общий флаг ---
    isGlobal: {
        type: Boolean,
        default: false, // true для новостей, false для персональных уведомлений
        index: true, // Индекс для быстрого поиска глобальных уведомлений
    }
}, {
    timestamps: true, // Добавляет createdAt и updatedAt
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
