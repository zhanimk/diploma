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
import AthleteListPage from './pages/coach/athletes/AthleteListPage';
import TournamentAppsPage from './pages/coach/tournaments/TournamentAppsPage';
import AthleteRequestsPage from './pages/coach/athletes/AthleteRequestsPage';
import AddAthletePage from './pages/coach/athletes/AddAthletePage';
import EditAthletePage from './pages/coach/athletes/EditAthletePage';

import { Toaster } from 'react-hot-toast';

// --- Админ-панель ---
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import EditTournament from './pages/admin/tournaments/EditTournament';
import AdminApplications from './pages/admin/applications/AdminApplications';
import AdminApplicationDetails from './pages/admin/applications/AdminApplicationDetails';
import AdminTournamentGrids from './pages/admin/tournaments/AdminTournamentGrids';
import ClubDetails from './pages/admin/clubs/ClubDetails';
import AdminSettings from './pages/admin/settings/AdminSettings';
import AdminNotifications from './pages/admin/notifications/AdminNotifications';
import AdminManagement from './pages/admin/users/AdminManagement';
import AdminTournaments from './pages/admin/tournaments/AdminTournaments'; // ИСПРАВЛЕНО
import ManageTournamentPage from './pages/admin/tournaments/ManageTournamentPage';
import ApplicationsTab from './pages/admin/tournaments/tabs/ApplicationsTab';
import GridsTab from './pages/admin/tournaments/tabs/GridsTab';
import ReportsTab from './pages/admin/tournaments/tabs/ReportsTab';

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
                    <Route path="tournaments" element={<AdminTournaments />} /> {/* ИСПРАВЛЕНО */}
                    <Route path="tournaments/edit/:id" element={<EditTournament />} />
                    <Route path="tournaments/grids/:id" element={<AdminTournamentGrids />} />
                    <Route path="tournaments/manage/:id" element={<ManageTournamentPage />}>
                        <Route path="applications" element={<ApplicationsTab />} />
                        <Route path="grids" element={<GridsTab />} />
                        <Route path="reports" element={<ReportsTab />} />
                    </Route>
                    <Route path="applications" element={<AdminApplications />} />
                    <Route path="applications/:id" element={<AdminApplicationDetails />} />
                    <Route path="management" element={<AdminManagement />} />
                    <Route path="clubs/:id" element={<ClubDetails />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="notifications" element={<AdminNotifications />} />
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
                     <Route path='/' element={<HomePage />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/tournaments' element={<TournamentListScreen />} />
                    <Route path='/tournaments/:id' element={<TournamentDetailScreen />} />

                    {/* Redirects and private routes */}
                    <Route path='/profile' element={<PrivateRoute><ProfileRedirectPage /></PrivateRoute>} />

                    <Route path='/athlete/dashboard' element={<PrivateRoute role='athlete'><AthleteDashboard /></PrivateRoute>} />
                    <Route path='/athlete/profile' element={<PrivateRoute role='athlete'><AthleteProfile /></PrivateRoute>} />
                    <Route path='/athlete/tournaments' element={<PrivateRoute role='athlete'><MyTournaments /></PrivateRoute>} />
                    <Route path='/athlete/results' element={<PrivateRoute role='athlete'><AthleteResultsPage /></PrivateRoute>} />
                    <Route path='/athlete/find-coach' element={<PrivateRoute role='athlete'><FindCoachPage /></PrivateRoute>} />

                    <Route path='/coach/dashboard' element={<PrivateRoute role='coach'><CoachDashboard /></PrivateRoute>} />
                    <Route path='/coach/profile' element={<PrivateRoute role='coach'><CoachProfile /></PrivateRoute>} />
                    <Route path='/coach/athletes' element={<PrivateRoute role='coach'><AthleteListPage /></PrivateRoute>} />
                    <Route path='/coach/athletes/add' element={<PrivateRoute role='coach'><AddAthletePage /></PrivateRoute>} />
                    <Route path='/coach/athletes/edit/:id' element={<PrivateRoute role='coach'><EditAthletePage /></PrivateRoute>} />
                    <Route path='/coach/applications' element={<PrivateRoute role='coach'><TournamentAppsPage /></PrivateRoute>} />
                    <Route path='/coach/requests' element={<PrivateRoute role='coach'><AthleteRequestsPage /></PrivateRoute>} />
                </Routes>
            </main>
            {!isAuthPage && !isUserDashboard && <Footer />}
        </div>
    );
};

export default App;
