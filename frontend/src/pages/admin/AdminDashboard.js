
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Calendar, Settings } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard admin-container">
            <header className="admin-header">
                <h1><Shield size={32} /> Әкімші панелі</h1>
                <p>Платформаны басқарудың негізгі орталығы</p>
            </header>

            <div className="admin-nav-cards">
                <Link to="/admin/tournaments" className="nav-card">
                    <Calendar size={48} />
                    <div className="nav-card-body">
                        <h2>Турнирлер</h2>
                        <p>Жаңа турнирлер құру, бар турнирлерді басқару және өтінімдерді қарау.</p>
                    </div>
                </Link>

                <Link to="/admin/users" className="nav-card">
                    <Users size={48} />
                    <div className="nav-card-body">
                        <h2>Пайдаланушылар</h2>
                        <p>Жүйедегі барлық пайдаланушыларды (спортшылар, жаттықтырушылар, төрешілер) басқару.</p>
                    </div>
                </Link>

                <Link to="/admin/settings" className="nav-card">
                    <Settings size={48} />
                    <div className="nav-card-body">
                        <h2>Жүйе баптаулары</h2>
                        <p>Жалпы платформа баптауларын, ережелерді және басқа параметрлерді реттеу.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
