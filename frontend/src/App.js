import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import setAuthToken from './utils/setAuthToken'; // Импортируем нашу утилиту

import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Импорт страниц
import HomePage from './pages/Home/HomePage';
import Login from './pages/Home/Login';
import Register from './pages/Home/Registration';
import TournamentListScreen from './pages/tournaments/TournamentListScreen';
import TournamentDetailScreen from './pages/tournaments/TournamentDetailScreen';
import AthleteDashboard from './pages/athlete/AthleteDashboard';
import FindCoachPage from './pages/athlete/FindCoachPage';
import MyTournaments from './pages/athlete/MyTournaments';
import AthleteResultsPage from './pages/athlete/AthleteResultsPage';
import CoachDashboard from './pages/coach/CoachDashboard';
import AthleteListPage from './pages/coach/AthleteListPage';
import TournamentAppsPage from './pages/coach/TournamentAppsPage';
import AthleteRequestsPage from './pages/coach/AthleteRequestsPage';
import AddAthletePage from './pages/coach/AddAthletePage';
import EditAthletePage from './pages/coach/EditAthletePage';
import ProfilePage from './pages/profile/ProfilePage';
import { Toaster } from 'react-hot-toast';

// Админ-панель компоненттері
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTournaments from './pages/admin/AdminTournaments';
import CreateTournament from './pages/admin/CreateTournament';
import AdminApplications from './pages/admin/AdminApplications';
import AdminApplicationDetails from './pages/admin/AdminApplicationDetails';

// Check for token and set auth headers
const userInfo = JSON.parse(localStorage.getItem('userInfo'));
if (userInfo && userInfo.token) {
    setAuthToken(userInfo.token);
}

const App = () => {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    // Render Admin layout for admin pages
    if (isAdminPage) {
        return (
            <Routes>
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="tournaments" element={<AdminTournaments />} />
                    <Route path="tournaments/create" element={<CreateTournament />} />
                    <Route path="applications" element={<AdminApplications />} />
                    <Route path="applications/:id" element={<AdminApplicationDetails />} />
                </Route>
            </Routes>
        );
    }

    // Render main layout (with or without Header/Footer)
    return (
        <div className="App">
            {!isAuthPage && <Header />}
            <main>
                <Toaster position="top-right" />
                <Routes>
                    {/* Публичные маршруты */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/tournaments" element={<TournamentListScreen />} />
                    <Route path="/tournaments/:id" element={<TournamentDetailScreen />} />

                    {/* Общий приватный маршрут для профиля */}
                    <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

                    {/* Приватные маршруты спортсмена */}
                    <Route path="/athlete/dashboard" element={<PrivateRoute><AthleteDashboard /></PrivateRoute>} />
                    <Route path="/athlete/find-coach" element={<PrivateRoute><FindCoachPage /></PrivateRoute>} />
                    <Route path="/athlete/my-tournaments" element={<PrivateRoute><MyTournaments /></PrivateRoute>} />
                    <Route path="/athlete/results" element={<PrivateRoute><AthleteResultsPage /></PrivateRoute>} />

                    {/* Приватные маршруты тренера */}
                    <Route path="/coach/dashboard" element={<PrivateRoute><CoachDashboard /></PrivateRoute>} />
                    <Route path="/coach/my-athletes" element={<PrivateRoute><AthleteListPage /></PrivateRoute>} />
                    <Route path="/coach/applications" element={<PrivateRoute><TournamentAppsPage /></PrivateRoute>} />
                    <Route path="/coach/requests" element={<PrivateRoute><AthleteRequestsPage /></PrivateRoute>} />
                    <Route path="/coach/register-athlete" element={<PrivateRoute><AddAthletePage /></PrivateRoute>} />
                    <Route path="/coach/edit-athlete/:athleteId" element={<PrivateRoute><EditAthletePage /></PrivateRoute>} />

                </Routes>
            </main>
            {!isAuthPage && <Footer />}
        </div>
    );
};

export default App;
