
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './CoachDashboard.css'; 
import { Users, LogIn, Shield, Edit, User } from 'lucide-react';

// =========================================
//   NEW StatCard Component (V4 Design)
// =========================================
const StatCard = ({ icon, value, label, linkTo, colorClass }) => (
    <Link to={linkTo} className="stat-card-link">
        <div className={`stat-card-v4 ${colorClass}`}>
            <div className="stat-card-v4__icon-wrapper">{icon}</div>
            <div className="stat-card-v4__content">
                <div className="stat-card-v4__value">{value}</div>
                <div className="stat-card-v4__label">{label}</div>
            </div>
        </div>
    </Link>
);

const CoachDashboard = () => {
    const [stats, setStats] = useState({ athleteCount: 0, requestCount: 0, tournamentCount: 0 });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [athletesRes, requestsRes] = await Promise.all([
                axios.get('/api/users/coach/my-athletes', { headers: { 'Cache-Control': 'no-cache' } }),
                axios.get('/api/users/coach/student-requests', { headers: { 'Cache-Control': 'no-cache' } })
            ]);
            setStats({
                athleteCount: athletesRes.data.length,
                requestCount: requestsRes.data.filter(r => r.status === 'pending').length,
                tournamentCount: 0 // Placeholder
            });
        } catch (error) {
            console.error("Деректерді алу кезінде қате:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div className="container coach-dashboard-grid">
            <nav className="coach-dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/coach/dashboard" className="active">Басты бет</Link></li>
                    <li><Link to="/profile">Профильді өңдеу</Link></li>
                    <li><Link to="/coach/my-athletes">Менің спортшыларым</Link></li>
                    <li><Link to="/coach/applications">Турнирлік өтінімдер</Link></li>
                    <li><Link to="/coach/requests">Қосылу сұраныстары</Link></li>
                </ul>
            </nav>

            <main className="coach-dashboard-content">
                <header className="page-header">
                    <h1>Қош келдіңіз, Жаттықтырушы!</h1>
                    <p>Бұл сіздің команданы басқаруға арналған ыңғайлы панеліңіз.</p>
                </header>

                {loading ? <p>Жүктелуде...</p> : (
                     <div className="stats-grid-coach"> 
                        <StatCard 
                            icon={<Users size={48} />} 
                            value={stats.athleteCount} 
                            label="Менің спортшыларым" 
                            linkTo="/coach/my-athletes"
                            colorClass="card-blue"
                        />
                        <StatCard 
                            icon={<LogIn size={48} />} 
                            value={stats.requestCount} 
                            label="Күтілудегі сұраныстар" 
                            linkTo="/coach/requests"
                            colorClass="card-purple"
                        />
                        <StatCard 
                            icon={<Shield size={48} />} 
                            value={stats.tournamentCount} 
                            label="Белсенді турнирлер" 
                            linkTo="/coach/applications"
                            colorClass="card-green"
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default CoachDashboard;
