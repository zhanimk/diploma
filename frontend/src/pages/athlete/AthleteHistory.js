import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import './Dashboard.css';

// Функция для определения класса медали
const getMedalClass = (place) => {
    if (place === 1) return 'gold';
    if (place === 2) return 'silver';
    if (place === 3) return 'bronze';
    return 'none';
};

const AthleteHistory = () => {
    const { user } = useSelector((state) => state.auth);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                setLoading(true);
                // Эндпоинт для получения истории выступлений конкретного атлета
                const { data } = await axios.get(`/api/users/${user._id}/history`);
                setHistory(data);
                setError(null);
            } catch (err) {
                const errorMessage = 'Тарихты жүктеу кезінде қате пайда болды.';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    // Расчет статистики
    const totalFights = history.reduce((acc, curr) => acc + curr.fights, 0);
    const totalWins = history.reduce((acc, curr) => acc + curr.wins, 0);
    const winRate = totalFights > 0 ? ((totalWins / totalFights) * 100).toFixed(0) : 0;

    return (
        <div className="container dashboard-grid">
            <nav className="dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/athlete/dashboard">Профиль</Link></li>
                    <li><Link to="/athlete/find-coach">Жаттықтырушыны табу</Link></li>
                    <li><Link to="/athlete/tournaments">Менің турнирлерім</Link></li>
                    <li><Link to="/athlete/history" className="active">Жарыс тарихы</Link></li>
                </ul>
            </nav>

            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h2>Жарыс тарихы</h2>
                    <p>Барлық өткен жарыстар, нәтижелер және статистика.</p>
                </header>

                <div className="stats-summary-grid">
                    <div className="stat-card">
                        <div className="stat-card__value">{totalFights}</div>
                        <div className="stat-card__label">Барлық жекпе-жектер</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__value">{totalWins}</div>
                        <div className="stat-card__label">Жеңістер</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__value">{history.length}</div>
                        <div className="stat-card__label">Турнирлер</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__value">{winRate}%</div>
                        <div className="stat-card__label">Жеңіс пайызы</div>
                    </div>
                </div>

                <div className="card list-container">
                    <h3>Өткен турнирлер</h3>
                    {loading ? (
                        <p>Жүктелуде...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : history.length > 0 ? (
                        <ul className="history-list">
                            {history.map((item) => (
                                <li key={item._id} className="history-item">
                                    <div className="history-item__info">
                                        <span className="history-item__name">{item.tournamentName}</span>
                                        <div className="history-item__meta">
                                            <span>{new Date(item.date).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{item.fights} жекпе-жек, {item.wins} жеңіс</span>
                                        </div>
                                    </div>
                                    <div className={`medal ${getMedalClass(item.place)}`}>
                                        {item.place ? `${item.place}-орын` : 'Қатысты'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="centered-message">
                            <p>Сізде әлі аяқталған турнирлер жоқ.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AthleteHistory;
