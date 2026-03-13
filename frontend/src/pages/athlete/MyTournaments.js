
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AthleteDashboard.css'; 
import { Shield, Calendar, MapPin, Award, Clock, CheckCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const statusConfig = {
        pending: { text: 'На рассмотрении', icon: <Clock size={14} />, color: '#ffc107' },
        approved: { text: 'Подтверждена', icon: <CheckCircle size={14} />, color: '#28a745' },
        rejected: { text: 'Отклонена', icon: <XCircle size={14} />, color: '#dc3545' }
    };
    const currentStatus = statusConfig[status] || statusConfig.pending;
    return (
        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: currentStatus.color, fontWeight: 'bold', marginTop: '10px' }}>
            {currentStatus.icon}
            Статус: {currentStatus.text}
        </p>
    );
};

const MyTournaments = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useSelector((state) => state.auth);

    const fetchTournaments = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/applications/athlete-tournaments');
            setApplications(data);
            setError(null);
        } catch (err) {
            setError("Турнирлер туралы ақпаратты алу кезінде қате.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    return (
        <div className="container athlete-dashboard-grid">
            <nav className="athlete-dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/athlete/dashboard">Басты бет</Link></li>
                    <li><Link to="/athlete/my-tournaments" className="active">Менің турнирлерім</Link></li>
                    {/* --- ДОБАВЛЕН НОВЫЙ ПУНКТ МЕНЮ --- */}
                    <li><Link to="/athlete/results">Нәтижелер тарихы</Link></li>
                </ul>
            </nav>

            <main className="athlete-dashboard-content">
                <header className="page-header">
                    <h1>Менің турнирлерім</h1>
                    <p>Сіздің қатысуыңызбен өткен жарыстар, олардың статусы және нәтижелері.</p>
                </header>

                {loading && <p>Жүктелуде...</p>}
                {error && <div className="error-message">{error}</div>}

                {!loading && !error && (
                    <div className="list-container">
                        {applications.length > 0 ? applications.map(app => {
                            const athleteResult = app.results?.find(result => result.athlete === user._id);

                            return app.tournament && (
                                <div key={app._id} className="item-card">
                                    <div className="item-card__info">
                                        <h3><Shield size={18} style={{marginRight: '8px'}}/>{app.tournament.name}</h3>
                                        <p><Calendar size={14} style={{marginRight: '8px'}}/>{new Date(app.tournament.date).toLocaleDateString()}</p>
                                        <p><MapPin size={14} style={{marginRight: '8px'}}/>{app.tournament.location || 'Орын көрсетілмеген'}</p>
                                        
                                        <StatusBadge status={app.status} />

                                        {athleteResult && typeof athleteResult.place === 'number' && (
                                            <p style={{marginTop: '10px', fontWeight: 'bold', color: 'var(--text-primary-dark)'}}>
                                                <Award size={16} color="#ffc107" style={{marginRight: '8px'}}/> 
                                                Орын: {athleteResult.place}
                                            </p>
                                        )}
                                    </div>
                                    <Link to={`/tournaments/${app.tournament._id}`} className="btn btn-secondary">
                                        Толығырақ
                                    </Link>
                                </div>
                            );
                        }) : (
                            <div className="empty-state">
                                <p>Сіз әлі ешбір турнирге тіркелмегенсіз. Жаттықтырушыңыздан сұраңыз.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyTournaments;
