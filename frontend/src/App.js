import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// Исправленные пути к страницам
import HomePage from './pages/Home/HomePage';
import Login from './pages/Home/Login';
import Register from './pages/Home/Registration'; 

// Страницы панелей управления
import AthleteDashboard from './pages/athlete/AthleteDashboard';
import FindCoachPage from './pages/athlete/FindCoachPage';
import CoachDashboard from './pages/coach/CoachDashboard';

import { Toaster } from 'react-hot-toast';

const App = () => {
    return (
        <div className="App">
            <Header />
            <main>
                <Toaster position="top-right" />
                <Routes>
                    {/* Публичные маршруты */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Приватные маршруты для спортсмена */}
                    <Route path="/athlete/dashboard" element={<PrivateRoute><AthleteDashboard /></PrivateRoute>} />
                    <Route path="/athlete/find-coach" element={<PrivateRoute><FindCoachPage /></PrivateRoute>} />
                    
                    {/* Приватные маршруты для тренера */}
                    <Route path="/coach/dashboard" element={<PrivateRoute><CoachDashboard /></PrivateRoute>} />
                    
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

export default App;
