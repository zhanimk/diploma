import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Dashboard.css'; 

const FindCoachPage = () => {
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sentRequests, setSentRequests] = useState([]); 

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                // Используем новый, безопасный эндпоинт
                const { data } = await axios.get('/api/users/coaches');
                setCoaches(data); // Фильтрация больше не нужна
            } catch (error) {
                console.error('Failed to fetch coaches', error);
                toast.error('Жаттықтырушылар тізімін жүктей алмады.');
            } finally {
                setLoading(false);
            }
        };

        fetchCoaches();
    }, []);

    const handleSendRequest = async (coachId) => {
        const requestPromise = axios.post('/api/users/athlete/send-request', { coachId })
            .then(res => {
                setSentRequests(prev => [...prev, coachId]); 
                return res.data.message;
            });

        toast.promise(requestPromise, {
            loading: 'Сұраныс жіберілуде...',
            success: (message) => <b>{message || 'Сұраныс сәтті жіберілді!'}</b>,
            error: (err) => {
                const errorMessage = err.response?.data?.message || 'Сұранысты жіберу кезінде қате.';
                return <b>{errorMessage}</b>;
            },
        });
    };

    if (loading) {
        return <div className="container">Жүктеу...</div>;
    }

    return (
        <div className="container">
            <h2>Жаттықтырушыны табу</h2>
            <p>Төменде қолжетімді жаттықтырушылардың тізімі келтірілген. Өзіңізге сұраныс жіберу үшін біреуін таңдаңыз.</p>
            <div className="coaches-list">
                {coaches.length > 0 ? (
                    coaches.map(coach => (
                        <div key={coach._id} className="card coach-card">
                            <h4>{coach.firstName} {coach.lastName}</h4>
                            <p><strong>Email:</strong> {coach.email}</p>
                            <p><strong>Қала:</strong> {coach.city || 'Көрсетілмеген'}</p>
                            <p><strong>Клуб:</strong> {coach.club || 'Көрсетілмеген'}</p>
                            <button 
                                onClick={() => handleSendRequest(coach._id)}
                                disabled={sentRequests.includes(coach._id)} 
                                className="f-btn-main"
                            >
                                {sentRequests.includes(coach._id) ? 'Сұраныс жіберілді' : 'Сұраныс жіберу'}
                            </button>
                        </div>
                    ))
                ) : (
                    <p>Қазіргі уақытта қолжетімді жаттықтырушылар жоқ.</p>
                )}
            </div>
        </div>
    );
};

export default FindCoachPage;
