
const mongoose = require('mongoose');

const gridSchema = new mongoose.Schema({
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Tournament'
    },
    ageCategory: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'AgeCategory' // Убедитесь, что у вас есть модель AgeCategory
    },
    weightCategory: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'WeightCategory' // Убедитесь, что у вас есть модель WeightCategory
    },
    // Простое строковое представление для удобства
    categoryName: {
        type: String, 
        required: true
    },
    gridType: {
        type: String,
        required: true,
        enum: ['ROUND_ROBIN', 'OLYMPIC']
    },
    athletes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    matches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
    }],
    // Для олимпийской системы, чтобы знать корень дерева матчей
    rootMatch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        default: null
    }
}, {
    timestamps: true
});

const Grid = mongoose.model('Grid', gridSchema);

module.exports = Grid;
