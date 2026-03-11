
import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { Shield, Calendar, Users, FileCheck, Settings, LogOut } from 'lucide-react';
import './AdminLayout.css';
import toast from 'react-hot-toast';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        toast.success('Сіз жүйеден сәтті шықтыңыз!');
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <Shield size={30} />
                    <h2>ZHUDOKZ ADMIN</h2>
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
                    <NavLink to="/admin/clubs">
                        <Users size={20} />
                        <span>Клубтар</span>
                    </NavLink>
                     <NavLink to="/admin/applications">
                        <FileCheck size={20} />
                        <span>Өтінімдер</span>
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
