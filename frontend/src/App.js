import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import CoachDashboard from './pages/CoachDashboard';
import JudgeDashboard from './pages/JudgeDashboard';
import ForgotPassword from './pages/ForgotPassword';

// Этот компонент-шаблон добавляет Header и Footer к дочерним страницам
const MainLayout = () => {
  return (
    <div>
      <Header />
      <main>
        <Outlet /> {/* Сюда будут подставляться дочерние страницы */}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Маршруты БЕЗ Header и Footer */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/forgot" element={<ForgotPassword />} />

      {/* Маршруты, использующие шаблон MainLayout (С Header и Footer) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="coach/dashboard" element={<CoachDashboard />} />
        <Route path="judge/dashboard" element={<JudgeDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
