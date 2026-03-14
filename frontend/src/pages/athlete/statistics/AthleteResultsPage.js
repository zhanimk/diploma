
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../dashboard/AthleteDashboard.css'; // Используем тот же стиль
import { Trophy, Calendar, MapPin, Shield, BarChart2 } from 'lucide-react';

const AthleteResultsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useSelector((state) => state.auth);

    const fetchResults = useCallback(async () => {
        try {
            setLoading(true);
            // Мы будем использовать тот же эндпоинт, что и для "Моих турниров",
            // так как он уже возвращает заявки с результатами.
            const { data } = await axios.get('/api/applications/athlete-tournaments');
            // Фильтруем заявки, оставляя только те, где есть результаты
            const completedApps = data.filter(app => app.results && app.results.length > 0);
            setApplications(completedApps);
            setError(null);
        } catch (err) {
            setError("Нәтижелер туралы ақпаратты алу кезінде қате.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    return (
        <div className="container athlete-dashboard-grid">
            {/* --- НАВИГАЦИЯ --- */}
            <nav className="athlete-dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/athlete/dashboard">Басты бет</Link></li>
                    <li><Link to="/athlete/my-tournaments">Менің турнирлерім</Link></li>
                    <li><Link to="/athlete/results" className="active">Нәтижелер тарихы</Link></li>
                </ul>
            </nav>

            {/* --- КОНТЕНТ СТРАНИЦЫ --- */}
            <main className="athlete-dashboard-content">
                <header className="page-header">
                    <h1>Нәтижелер тарихы</h1>
                    <p>Сіздің аяқталған турнирлердегі жетістіктеріңіз бен нәтижелеріңіз.</p>
                </header>

                {loading && <p>Жүктелуде...</p>}
                {error && <div className="error-message">{error}</div>}

                {!loading && !error && (
                    <div className="list-container">
                        {applications.length > 0 ? applications.map(app => {
                            const athleteResult = app.results?.find(result => result.athlete === user._id);
                            
                            return app.tournament && athleteResult ? (
                                <div key={app._id} className="item-card">
                                    <div className="item-card__info">
                                        <h3><Shield size={18} style={{marginRight: '8px'}}/>{app.tournament.name}</h3>
                                        <p><Calendar size={14} style={{marginRight: '8px'}}/>{new Date(app.tournament.date).toLocaleDateString()}</p>
                                        <p><MapPin size={14} style={{marginRight: '8px'}}/>{app.tournament.location || 'Орын көрсетілмеген'}</p>
                                        
                                        {/* Отображаем занятое место */}
                                        {typeof athleteResult.place === 'number' && (
                                            <p style={{marginTop: '15px', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center'}}>
                                                <Trophy size={18} style={{marginRight: '8px'}}/> 
                                                Нәтиже: {athleteResult.place}-орын
                                            </p>
                                        )}

                                        {/* TODO: Placeholder для будущей статистики боев */}
                                        <p style={{marginTop: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center'}}>
                                            <BarChart2 size={14} style={{marginRight: '8px'}}/>
                                            Жеңіс/жеңіліс статистикасы (жақында)
                                        </p>
                                    </div>
                                    <Link to={`/tournaments/${app.tournament._id}`} className="btn btn-secondary">
                                        Толығырақ
                                    </Link>
                                </div>
                            ) : null;
                        }) : (
                            <div className="empty-state">
                                <p>Аяқталған турнирлер бойынша нәтижелер әлі жоқ.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AthleteResultsPage;