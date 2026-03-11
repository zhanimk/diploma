
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import setAuthToken from './utils/setAuthToken';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

// --- Основные страницы ---
import HomePage from './pages/home/HomePage';
import Login from './pages/home/Login';
import Register from './pages/home/Registration';
import TournamentListScreen from './pages/tournaments/TournamentListScreen';
import TournamentDetailScreen from './pages/tournaments/TournamentDetailScreen';
import ProfileRedirectPage from './pages/profile/ProfileRedirectPage';

// --- Страницы спортсмена ---
import AthleteDashboard from './pages/athlete/AthleteDashboard';
import AthleteProfile from './pages/athlete/AthleteProfile';
import FindCoachPage from './pages/athlete/FindCoachPage';
import MyTournaments from './pages/athlete/MyTournaments';
import AthleteResultsPage from './pages/athlete/AthleteResultsPage';

// --- Страницы тренера ---
import CoachDashboard from './pages/coach/CoachDashboard';
import CoachProfile from './pages/coach/CoachProfile';
import AthleteListPage from './pages/coach/AthleteListPage';
import TournamentAppsPage from './pages/coach/TournamentAppsPage';
import AthleteRequestsPage from './pages/coach/AthleteRequestsPage';
import AddAthletePage from './pages/coach/AddAthletePage';
import EditAthletePage from './pages/coach/EditAthletePage';

import { Toaster } from 'react-hot-toast';

// --- Админ-панель ---
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTournaments from './pages/admin/AdminTournaments';
import CreateTournament from './pages/admin/CreateTournament';
import EditTournament from './pages/admin/EditTournament';
import AdminApplications from './pages/admin/AdminApplications';
import AdminApplicationDetails from './pages/admin/AdminApplicationDetails';
import AdminTournamentGrids from './pages/admin/AdminTournamentGrids';
import AdminClubs from './pages/admin/AdminClubs';

const userInfo = JSON.parse(localStorage.getItem('userInfo'));
if (userInfo && userInfo.token) {
    setAuthToken(userInfo.token);
}

const App = () => {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const isUserDashboard = location.pathname.startsWith('/athlete') || location.pathname.startsWith('/coach');

    // --- Маршруты для Админ-панели ---
    if (isAdminPage) {
        return (
            <Routes>
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="tournaments" element={<AdminTournaments />} />
                    <Route path="tournaments/create" element={<CreateTournament />} />
                    <Route path="tournaments/edit/:id" element={<EditTournament />} />
                    <Route path="tournaments/grids/:id" element={<AdminTournamentGrids />} />
                    <Route path="applications" element={<AdminApplications />} />
                    <Route path="applications/:id" element={<AdminApplicationDetails />} />
                    <Route path="clubs" element={<AdminClubs />} />
                </Route>
            </Routes>
        );
    }

    // --- Основные маршруты приложения ---
    return (
        <div className="app-container">
            {!isAuthPage && <Header />}
            <main className="main-content">
                <Toaster position="top-right" />
                <Routes>
                    {/* Публичные маршруты */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/tournaments" element={<TournamentListScreen />} />
                    <Route path="/tournaments/:id" element={<TournamentDetailScreen />} />

                    {/* Перенаправление со старого профиля */}
                    <Route path="/profile" element={<PrivateRoute><ProfileRedirectPage /></PrivateRoute>} />

                    {/* Приватные маршруты спортсмена */}
                    <Route path="/athlete/dashboard" element={<PrivateRoute><AthleteDashboard /></PrivateRoute>} />
                    <Route path="/athlete/profile" element={<PrivateRoute><AthleteProfile /></PrivateRoute>} />
                    <Route path="/athlete/find-coach" element={<PrivateRoute><FindCoachPage /></PrivateRoute>} />
                    <Route path="/athlete/my-tournaments" element={<PrivateRoute><MyTournaments /></PrivateRoute>} />
                    <Route path="/athlete/results" element={<PrivateRoute><AthleteResultsPage /></PrivateRoute>} />

                    {/* Приватные маршруты тренера */}
                    <Route path="/coach/dashboard" element={<PrivateRoute><CoachDashboard /></PrivateRoute>} />
                    <Route path="/coach/profile" element={<PrivateRoute><CoachProfile /></PrivateRoute>} />
                    <Route path="/coach/my-athletes" element={<PrivateRoute><AthleteListPage /></PrivateRoute>} />
                    <Route path="/coach/applications" element={<PrivateRoute><TournamentAppsPage /></PrivateRoute>} />
                    <Route path="/coach/requests" element={<PrivateRoute><AthleteRequestsPage /></PrivateRoute>} />
                    <Route path="/coach/register-athlete" element={<PrivateRoute><AddAthletePage /></PrivateRoute>} />
                    <Route path="/coach/edit-athlete/:athleteId" element={<PrivateRoute><EditAthletePage /></PrivateRoute>} />
                </Routes>
            </main>
            {!isAuthPage && !isUserDashboard && <Footer />}
        </div>
    );
};

export default App;
