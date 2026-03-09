const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    registrationDeadline: {
        type: Date,
        required: true
    },
    tatamiCount: {
        type: Number,
        required: true,
        min: 1
    },
    weightCategories: [{
        type: String,
        required: true
    }],
    ageCategories: [{
        type: String,
        required: true
    }],
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    participants: [{
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        weightCategory: { 
            type: String, 
            required: true 
        },
        ageCategory: { 
            type: String, 
            required: true 
        }
    }],
    grid: {
        type: mongoose.Schema.Types.Mixed
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED'],
        default: 'PENDING'
    }
}, {
    timestamps: true
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;
