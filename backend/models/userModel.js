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
        required: false // Weight might be set during tournament registration
    },
    // The club the athlete wants to join or belongs to
    club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club',
        // Required for athletes, but not for other roles
        required: function() { return this.role === 'athlete'; } 
    },
    // Status of the athlete's membership in the club
    clubStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        // Required for athletes, but not for other roles
        required: function() { return this.role === 'athlete'; }
    },
    rank: { // As per TZ "спортивный разряд/кю"
        type: String,
        required: false
    },

    // --- Coach-specific fields ---
    // A coach manages a club. We find the club by looking for a Club where the coach's ID matches.
    // The `students` and `studentRequests` arrays are now obsolete.

}, {
    timestamps: true
});

// --- METHODS ---

// Password matching method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
