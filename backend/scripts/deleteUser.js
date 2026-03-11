
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../config/db');
const User = require('../models/userModel');

// Исправленный путь к .env файлу в папке backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const deleteUser = async (email) => {
    if (!email) {
        console.error('❌ Пожалуйста, укажите email адрес для удаления.');
        process.exit(1);
    }

    const closeConnectionAndExit = async (exitCode = 0) => {
        try {
            await mongoose.connection.close();
        } finally {
            process.exit(exitCode);
        }
    };

    try {
        console.log('Подключение к базе данных...');
        await connectDB();
        console.log(`🔍 Поиск и удаление пользователя с email: ${email}...`);

        const result = await User.deleteOne({ email: email });

        if (result.deletedCount > 0) {
            console.log(`✅ Пользователь с email ${email} был успешно удален.`);
        } else {
            console.log(`ℹ️ Пользователь с email ${email} не найден.`);
        }

        await closeConnectionAndExit(0);

    } catch (error) {
        console.error(`❌ Ошибка при удалении пользователя: ${error.message}`);
        await closeConnectionAndExit(1);
    }
};

const emailToDelete = process.argv[2];
deleteUser(emailToDelete);
