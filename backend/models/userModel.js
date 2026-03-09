const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    phoneNumber: {
        type: String,
        required: false
    },
    dateOfBirth: {
        type: Date,
        required: false
    },
    club: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    // Поле для спортсмена: ссылка на его тренера
    coach: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Поле для тренера: список его учеников
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Новое поле для тренера: запросы от спортсменов
    studentRequests: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
    }],
    // Старое поле, которое мы больше не будем использовать
    coachRequests: [{
        coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
    }]
}, {
    timestamps: true
});

// Метод для сравнения введенного пароля с хешированным
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware для хеширования пароля перед сохранением
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
