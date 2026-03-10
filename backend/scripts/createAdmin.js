
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../config/db');
const User = require('../models/userModel');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const createAdmin = async () => {
    // Байланысты process.exit() шақырмас бұрын жабуға арналған функция
    const closeConnectionAndExit = async () => {
        await mongoose.connection.close();
        process.exit();
    };

    try {
        await connectDB();

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || '123456';

        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('--------------------------------------------------');
            console.log('ℹ️ Администратор уже существует. Пропускаем создание.');
            console.log(`   Email: ${adminEmail}`);
            console.log('--------------------------------------------------');
            await closeConnectionAndExit();
            return;
        }

        // Модельге сәйкес барлық міндетті өрістерді қосамыз
        const admin = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            gender: 'male', // Стандартты мән
            isConfirmed: true
        });

        console.log('--------------------------------------------------');
        console.log('✅ Администратор успешно создан!');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Пароль: ${adminPassword}`);
        console.log('--------------------------------------------------');
        
    } catch (error) {
        console.error(`❌ Ошибка при создании администратора: ${error.message}`);
    } finally {
        await closeConnectionAndExit();
    }
};

createAdmin();
