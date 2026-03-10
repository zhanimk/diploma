
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import './FindCoach.css'; 

const FindCoach = () => {
    const { user } = useSelector(state => state.auth);
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sentRequests, setSentRequests] = useState([]);

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get('/api/users/coaches');
                setCoaches(data);
                setError(null);
            } catch (err) {
                const message = 'Жаттықтырушылар тізімін алу мүмкін болмады.';
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };
        fetchCoaches();
    }, []);

    const handleSendRequest = (coachId) => {
        // ИЗМЕНЕНО: URL запроса для соответствия с бэкендом
        const promise = axios.post('/api/users/athlete/send-request', { coachId })
            .then(response => {
                setSentRequests([...sentRequests, coachId]);
                return response.data;
            });
        
        toast.promise(promise, {
            loading: 'Сұраныс жіберілуде...',
            success: <b>Сұраныс сәтті жіберілді!</b>,
            error: (err) => err.response?.data?.message || <b>Сұраныс жіберу кезінде қате.</b>
        });
    };

    if (user && user.coach) {
        return (
            <div className="container centered-container">
                <div className="card success-card">
                    <h2 className="success-card__title">Сіздің жаттықтырушыңыз бар</h2>
                    <p className="success-card__message">Сіз қазірдің өзінде бір жаттықтырушымен байланыстысыз. Жаңа сұраныс жіберу үшін алдымен ағымдағы байланысты үзуіңіз керек.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container find-coach-container">
            <header className="page-header">
                <h1>Жаттықтырушыны табу</h1>
                <p>Төменде қолжетімді жаттықтырушылардың тізімі келтірілген. Қосылуға сұраныс жіберу үшін батырманы басыңыз.</p>
            </header>

            {loading && <div className="loading-message">Жүктелуде...</div>}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && (
                <div className="coaches-list">
                    {coaches.length > 0 ? coaches.map(coach => (
                        <div key={coach._id} className="coach-card">
                            <div className="coach-card__info">
                                <h3 className="coach-card__name">{coach.firstName} {coach.lastName}</h3>
                                <p className="coach-card__meta">Email: {coach.email}</p>
                                {coach.club && <p className="coach-card__meta">Клуб: {coach.club}</p>}
                                {coach.city && <p className="coach-card__meta">Қала: {coach.city}</p>}
                            </div>
                            <div className="coach-card__action">
                                {
                                sentRequests.includes(coach._id) ? (
                                    <button className="f-btn-main" disabled>Сұраныс жіберілді</button>
                                ) : (
                                    <button onClick={() => handleSendRequest(coach._id)} className="f-btn-main">
                                        Сұраныс жіберу
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <p>Қазіргі уақытта қолжетімді жаттықтырушылар жоқ.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default FindCoach;
