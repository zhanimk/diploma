
import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import setAuthToken from './utils/setAuthToken';

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
import MyAthletes from './pages/coach/MyAthletes';
import CoachApplications from './pages/coach/CoachApplications';
import CoachRequests from './pages/coach/CoachRequests';
import RegisterAthletePage from './pages/coach/RegisterAthletePage';
import ProfilePage from './pages/profile/ProfilePage';
import { Toaster } from 'react-hot-toast';

// Админ-панель компоненттері
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTournaments from './pages/admin/AdminTournaments';
import CreateTournament from './pages/admin/CreateTournament';
import AdminApplications from './pages/admin/AdminApplications';
import AdminApplicationDetails from './pages/admin/AdminApplicationDetails'; // <--- ЖАҢАДАН ҚОСЫЛДЫ

// Бұл Layout енді тек админ емес беттер үшін қолданылады
const MainLayout = ({ children }) => {
    return (
        <div className="App">
            <Header />
            <main>
                <Toaster position="top-right" />
                {children}
            </main>
            <Footer />
        </div>
    );
};

const App = () => {

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            setAuthToken(user.token);
        }
    }, []);

    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');

    // Егер админ беті болса, AdminLayout-ты, болмаса MainLayout-ты көрсетеміз
    if (isAdminPage) {
        return (
            <Routes>
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    {/* Nested Routes for Admin Panel */}
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="tournaments" element={<AdminTournaments />} />
                    <Route path="tournaments/create" element={<CreateTournament />} />
                    <Route path="applications" element={<AdminApplications />} /> 
                    <Route path="applications/:id" element={<AdminApplicationDetails />} /> {/* <--- ЖАҢАДАН ҚОСЫЛДЫ */}
                    {/* <Route path="users" element={<AdminUsers />} /> */}
                    {/* <Route path="settings" element={<AdminSettings />} /> */}
                </Route>
            </Routes>
        );
    }

    return (
        <MainLayout>
            <Routes>
                {/* Публичные маршруты */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/tournaments" element={<TournamentListScreen />} />
                <Route path="/tournaments/:id" element={<TournamentDetailScreen />} />

                {/* --- ОБЩИЙ ПРИВАТНЫЙ МАРШРУТ ДЛЯ ПРОФИЛЯ --- */}
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

                {/* Приватные маршруты спортсмена */}
                <Route path="/athlete/dashboard" element={<PrivateRoute><AthleteDashboard /></PrivateRoute>} />
                <Route path="/athlete/find-coach" element={<PrivateRoute><FindCoachPage /></PrivateRoute>} />
                <Route path="/athlete/my-tournaments" element={<PrivateRoute><MyTournaments /></PrivateRoute>} />
                <Route path="/athlete/results" element={<PrivateRoute><AthleteResultsPage /></PrivateRoute>} />

                {/* Приватные маршруты тренера */}
                <Route path="/coach/dashboard" element={<PrivateRoute><CoachDashboard /></PrivateRoute>} />
                <Route path="/coach/my-athletes" element={<PrivateRoute><MyAthletes /></PrivateRoute>} />
                <Route path="/coach/applications" element={<PrivateRoute><CoachApplications /></PrivateRoute>} />
                <Route path="/coach/requests" element={<PrivateRoute><CoachRequests /></PrivateRoute>} />
                <Route path="/coach/register-athlete" element={<PrivateRoute><RegisterAthletePage /></PrivateRoute>} />

            </Routes>
        </MainLayout>
    );
};

export default App;
