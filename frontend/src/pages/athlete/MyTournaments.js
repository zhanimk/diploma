import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import './Dashboard.css'; 

const getStatusInfo = (status) => {
    switch (status) {
        case 'pending':
            return { text: 'Растау күтілуде', className: 'pending' };
        case 'approved':
            return { text: 'Расталды', className: 'registered' }; // Используем стиль registered для одобренных
        case 'rejected':
            return { text: 'Қабылданбады', className: 'danger' }; // Предполагаем, что есть стиль для отклоненных
        default:
            return { text: status, className: 'default' };
    }
};

const MyTournaments = () => {
    const { user } = useSelector((state) => state.auth);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user) return;
            try {
                setLoading(true);
                // Эндпоинт для получения заявок пользователя
                const { data } = await axios.get(`/api/applications/my-applications`);
                setApplications(data);
                setError(null);
            } catch (err) {
                const errorMessage = 'Турнирлерді жүктеу кезінде қате.';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [user]);

    const handleCancelApplication = async (applicationId) => {
        // Логика отмены заявки (пока не реализуем, но кнопка будет)
        toast('Функционал пока в разработке');
    }

    return (
        <div className="container dashboard-grid">
            <nav className="dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/athlete/dashboard">Профиль</Link></li>
                    <li><Link to="/athlete/find-coach">Жаттықтырушыны табу</Link></li>
                    <li><Link to="/athlete/tournaments" className="active">Менің турнирлерім</Link></li>
                    <li><Link to="/athlete/history">Жарыс тарихы</Link></li>
                </ul>
            </nav>

            <main className="dashboard-content">
                 <header className="dashboard-header">
                    <h2>Менің турнирлерім</h2>
                    <p>Алдағы жарыстарға қатысуға берілген өтінімдер және олардың мәртебесі.</p>
                </header>

                <div className="card list-container">
                    <h3>Менің өтінімдерім</h3>
                     {loading ? (
                        <p>Жүктелуде...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : applications.length > 0 ? (
                        <ul className="tournaments-list">
                            {applications.map(app => {
                                const statusInfo = getStatusInfo(app.status);
                                return (
                                    <li key={app._id} className="tournament-item">
                                        <div className="tournament-item__info">
                                            <span className="tournament-item__name">{app.tournament.name}</span>
                                            <span className="tournament-item__date">
                                                {new Date(app.tournament.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="tournament-item__actions">
                                            <span className={`status-badge ${statusInfo.className}`}>{statusInfo.text}</span>
                                            {/* Можно добавить кнопку отмены, если статус позволяет */}
                                            {app.status === 'pending' && 
                                                <button onClick={() => handleCancelApplication(app._id)} className="f-btn-link danger-link small">Бас тарту</button>
                                            }
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="centered-message">
                            <p>Сізде белсенді өтінімдер жоқ.</p>
                            <Link to="/tournaments" className="f-btn-main small">Турнирлерді қарау</Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyTournaments;
