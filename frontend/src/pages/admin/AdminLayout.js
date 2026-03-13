import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { Shield, Calendar, Users, Settings, LogOut, Bell, Archive } from 'lucide-react';
import './AdminLayout.css';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const AdminLayout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Сіз жүйеден сәтті шықтыңыз');
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <Shield size={30} />
                    <h2>Әкімші панелі</h2>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/admin/dashboard">
                        <Shield size={20} />
                        <span>Басты бет</span>
                    </NavLink>
                    <NavLink to="/admin/tournaments">
                        <Calendar size={20} />
                        <span>Турнирлер</span>
                    </NavLink>
                     <NavLink to="/admin/notifications">
                        <Bell size={20} />
                        <span>Хабарландырулар</span>
                    </NavLink>
                    <NavLink to="/admin/management">  
                        <Users size={20} />
                        <span>Пайдаланушылар мен Клубтар</span>
                    </NavLink>
                     <NavLink to="/admin/archive">
                        <Archive size={20} />
                        <span>Мұрағат</span>
                    </NavLink>
                    <NavLink to="/admin/settings">
                        <Settings size={20} />
                        <span>Баптаулар</span>
                    </NavLink>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-button">
                        <LogOut size={20} />
                        <span>Шығу</span>
                    </button>
                </div>
            </aside>
            <main className="admin-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
