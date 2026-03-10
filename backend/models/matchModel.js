
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Tournament'
    },
    grid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Grid'
    },
    round: {
        type: Number,
        required: true,
    },
    matchNumber: { // Порядковый номер в сетке
        type: Number,
        required: true,
    },
    athlete1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null, // Может быть null, если участник еще не определен
    },
    athlete2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    loser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'IN_PROGRESS', 'FINISHED'],
        default: 'PENDING',
    },
    tatami: {
        type: Number,
    },
    // Поле для связи со следующим матчем
    nextMatch: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Match',
         default: null
    }
}, {
    timestamps: true
});

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
