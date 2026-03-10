require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Подключаемся к базе данных
connectDB();

const app = express();

// Middleware для обработки JSON
app.use(express.json());
// Middleware для обработки данных из форм
app.use(express.urlencoded({ extended: false }));

// Middleware для CORS
app.use(cors());


// --- Маршруты ---
// Все маршруты, начинающиеся с /api/users, будут обрабатываться файлом userRoutes
app.use('/api/users', require('./routes/userRoutes'));
// Добавляем маршруты для турниров
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
// Добавляем маршруты для заявок
app.use('/api/applications', require('./routes/applicationRoutes'));
// Добавляем маршруты для клубов
app.use('/api/clubs', require('./routes/clubRoutes'));


// --- Обработка ошибок ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));