require('dotenv').config();
const path = require('path');
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// --- API Routes ---
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/clubs', require('./routes/clubRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// --- Static Folder Setup ---
const dirname = path.resolve();
// Corrected path: It should be relative to the project root where 'uploads' is located.
app.use('/uploads', express.static(path.join(dirname, '/uploads')));


// --- Production Build ---
if (process.env.NODE_ENV === 'production') {
    // Serve frontend build
    app.use(express.static(path.join(dirname, '/frontend/build')));

    app.get('* ', (req, res) => 
        res.sendFile(path.resolve(dirname, 'frontend', 'build', 'index.html'))
    );
} else {
    app.get('/', (req, res) => {
        res.send("API is running...");
    });
}

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
