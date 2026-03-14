import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, Shield, Calendar, Plus, Bell, ArrowRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, clubs: 0, tournaments: 0, pendingClubs: 0 });
    const [recentTournaments, setRecentTournaments] = useState([]);
    const [pendingClubs, setPendingClubs] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/admin/dashboard', {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}` }
            });
            setStats({ 
                users: data.stats.totalUsers, 
                clubs: data.stats.totalClubs, 
                tournaments: data.stats.totalTournaments,
                pendingClubs: data.stats.pendingClubsCount
            });
            setRecentTournaments(data.recentTournamentsWithApps || []);
            setPendingClubs(data.pendingClubs || []);
            setAuditLogs(data.auditLogs || []);
        } catch (error) {
            toast.error('Не удалось загрузить данные для панели управления.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleVerifyClub = async (clubId) => {
        try {
            await axios.put(`/api/clubs/${clubId}/verify`, {}, {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}` }
            });
            toast.success('Клуб успешно верифицирован!');
            // Refresh data after verification
            fetchDashboardData();
        } catch (error) {
            toast.error('Ошибка при верификации клуба.');
        }
    };

    const getLogIcon = (action) => {
        switch (action) {
            case 'CREATE_TOURNAMENT': return <Calendar size={18} className="log-icon create" />;
            case 'REGISTER_USER': return <Users size={18} className="log-icon register" />;
            case 'VERIFY_CLUB': return <CheckCircle size={18} className="log-icon verify" />;
            case 'BLOCK_USER': return <AlertTriangle size={18} className="log-icon block" />;
            default: return <Clock size={18} className="log-icon generic" />;
        }
    }

    if (loading) {
        return <div className="loading-container">Загрузка данных...</div>
    }

    return (
        <div className="admin-dashboard-professional">
            <header className="dashboard-header-pro">
                <div className="header-text">
                    <h1>Басты бет</h1>
                    <p>Платформаның негізгі көрсеткіштері мен міндеттері.</p>
                </div>
                <div className="header-actions">
                    <Link to="/admin/tournaments/new" className="btn btn-primary">
                        <Plus size={18} /> Жаңа турнир құру
                    </Link>
                    <Link to="/admin/announcements" className="btn btn-secondary">
                        <Bell size={18} /> Хабарландыру жасау
                    </Link>
                </div>
            </header>

            <main className="dashboard-grid">
                <div className="main-column">
                    <section className="dashboard-section-pro">
                        <h2 className="section-title">Тексеруді қажет ететін клубтар</h2>
                        {pendingClubs.length > 0 ? (
                             <ul className="action-list">
                                {pendingClubs.map(club => (
                                    <li key={club._id} className="action-list-item">
                                        <div className="item-content">
                                            <Shield size={20} className="item-icon club-icon" />
                                            <div className="item-details">
                                                <span className="item-title">{club.name}</span>
                                                <span className="item-subtitle">{club.region}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleVerifyClub(club._id)} className="btn btn-tertiary verify-btn">
                                            <CheckCircle size={16} /> Верифицировать
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-state">Тексеруді күтіп тұрған клубтар жоқ.</p>
                        )}
                    </section>
                    
                    <section className="dashboard-section-pro">
                        <h2 className="section-title">Соңғы әрекеттер</h2>
                        {auditLogs.length > 0 ? (
                            <ul className="action-list">
                                {auditLogs.map(log => (
                                    <li key={log._id} className="action-list-item log-item">
                                        <div className="item-content">
                                            {getLogIcon(log.action)}
                                            <div className="item-details">
                                                 <span className="item-title">{log.description}</span>
                                                <span className="item-subtitle">{new Date(log.createdAt).toLocaleString()} by {log.user?.fullName || 'System'}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="empty-state">Жүйеде әрекеттер тіркелмеген.</p>
                        )}
                    </section>
                </div>

                <div className="sidebar-column">
                    <section className="dashboard-section-pro compact-stats">
                         <h2 className="section-title">Жалпы көрсеткіштер</h2>
                         <div className="stats-grid-pro">
                            <div className="stat-card-pro"><Users size={22} /><p>Пайдаланушылар</p><span>{stats.users}</span></div>
                            <div className="stat-card-pro"><Shield size={22} /><p>Клубтар</p><span>{stats.clubs}</span></div>
                            <div className="stat-card-pro"><Calendar size={22} /><p>Турнирлер</p><span>{stats.tournaments}</span></div>
                         </div>
                    </section>

                    <section className="dashboard-section-pro">
                         <h2 className="section-title">Жаңа өтінімдері бар турнирлер</h2>
                         {recentTournaments.length > 0 ? (
                            <ul className="action-list">
                                {recentTournaments.map(tourn => (
                                     <li key={tourn._id} className="action-list-item">
                                        <div className="item-content">
                                            <Calendar size={20} className="item-icon tournament-icon" />
                                            <div className="item-details">
                                                <span className="item-title">{tourn.name}</span>
                                                <span className="item-subtitle">Жаңа өтінімдер: <strong>{tourn.newApplicationsCount}</strong></span>
                                            </div>
                                        </div>
                                        <Link to={`/admin/tournaments/manage/${tourn._id}`} className="btn btn-tertiary">
                                            Басқару <ArrowRight size={16} />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                         ) : (
                             <p className="empty-state">Жаңа өтінімдері бар белсенді турнирлер жоқ.</p>
                         )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
