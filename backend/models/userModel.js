const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'Please add a first name'],
        },
        lastName: {
            type: String,
            required: [true, 'Please add a last name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        role: {
            type: String,
            required: true,
            enum: ['admin', 'coach', 'athlete', 'judge'], // Добавили judge
            default: 'athlete',
        },
        isBlocked: { // Поле для блокировки
            type: Boolean,
            required: true,
            default: false,
        },
        phone: {
            type: String,
            default: ''
        },
        club: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Club',
        },
        gender: {
            type: String,
            enum: ['male', 'female', ''],
            default: ''
        },
        dateOfBirth: {
            type: Date,
        },
        city: { 
            type: String,
        },
        rank: { 
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
