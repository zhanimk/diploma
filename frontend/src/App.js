
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';

import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/Home/HomePage';
import Login from './pages/Home/Login';
import Registration from './pages/Home/Registration';
import ForgotPassword from './pages/Home/ForgotPassword';
import Profile from './pages/athlete/Profile';
import CoachDashboard from './pages/coach/CoachDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import JudgeDashboard from './pages/judge/JudgeDashboard';

import { setUser } from './store/authSlice';
import setAuthToken from './utils/setAuthToken';

// Check for token and load user
if (localStorage.token) {
    setAuthToken(localStorage.token);
}

const App = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const loadUser = async () => {
            if (localStorage.token) {
                try {
                    const res = await axios.get('/api/users/profile');
                    dispatch(setUser(res.data));
                } catch (err) {
                    console.error('Failed to load user', err);
                    // Optional: dispatch logout action if token is invalid
                }
            }
        };
        loadUser();
    }, [dispatch]);

    return (
        <>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/coach/dashboard" element={<CoachDashboard />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/judge/dashboard" element={<JudgeDashboard />} />
                </Routes>
            </main>
            <Footer />
        </>
    );
};

export default App;
