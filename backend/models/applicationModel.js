const mongoose = require('mongoose');

// Эта схема описывает ОДНОГО спортсмена внутри заявки на турнир
const appliedAthleteSchema = mongoose.Schema({
    // Ссылка на самого спортсмена (для получения ФИО, даты рождения и т.д.)
    athlete: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // Заявленная весовая категория, в которой он должен выступать
    // Это будет просто число, например, 81 (означает категорию "до 81 кг")
    weightCategory: {
        type: Number,
        required: true,
    },
    // Фактический вес, зафиксированный на взвешивании. Может быть дробным.
    actualWeight: {
        type: Number,
        default: null // Изначально null, заполняется администратором
    },
    // Отметка администратора о том, что документы проверены и спортсмен допущен
    isVerifiedByAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
     // Поле для документов спортсмена в контексте ДАННОЙ заявки
    documents: [{
        docType: { 
            type: String, 
            enum: ['MEDICAL_CERTIFICATE', 'INSURANCE'], 
            required: true 
        },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
    }]
}, { _id: true }); // _id нужен, чтобы уникально идентифицировать запись о спортсмене ВНУТРИ заявки

const applicationSchema = mongoose.Schema(
    {
        // Массив спортсменов, поданных в этой заявке
        athletes: [appliedAthleteSchema],

        // На какой турнир подана заявка
        tournament: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Tournament',
        },

        // Какой тренер (и клуб) подал заявку
        coach: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },

        // Статус всей заявки целиком (на рассмотрении, принята, отклонена)
        status: {
            type: String,
            required: true,
            enum: ['PENDING', 'APPROVED', 'REJECTED'], // Статусы на английском для унификации
            default: 'PENDING',
        },
    },
    { 
        timestamps: true,
    }
);

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
