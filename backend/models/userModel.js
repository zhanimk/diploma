const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // --- Basic Info ---
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: { // Added phone field
        type: String,
        required: false // Making it optional
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['athlete', 'coach', 'judge', 'admin'],
        default: 'athlete'
    },
    gender: {
        type: String,
        required: function() { return this.role !== 'admin'; },
        enum: ['male', 'female']
    },
    city: {
        type: String,
        required: false
    },
    dateOfBirth: {
        type: Date,
        required: function() { return this.role === 'athlete'; },
    },

    // --- Athlete-specific fields ---
    weight: {
        type: Number,
        required: false
    },
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        required: false 
    },
    clubStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        required: false
    },
    rank: { 
        type: String,
        required: false
    },

}, {
    timestamps: true
});

// --- METHODS ---

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
