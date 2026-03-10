
const mongoose = require('mongoose');

const appliedAthleteSchema = mongoose.Schema({
    athlete: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    // --- ДОБАВЛЕНО ПОЛЕ ПОЛА ---
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female']
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    weight: {
        type: Number,
        required: true
    }
}, { _id: false });

const applicationSchema = mongoose.Schema(
    {
        athletes: [appliedAthleteSchema],
        tournament: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Tournament',
        },
        coach: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        results: [{
            athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            place: { type: Number }
        }]
    },
    { 
        timestamps: true,
    }
);

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
