import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Check, X, Mail, Shield, MapPin } from 'lucide-react';
import './CoachDashboard.css';

const AthleteRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/users/coach/student-requests');
            setRequests(data);
        } catch (err) {
            setError('Сұраныстарды алу кезінде қате болды.');
            toast.error('Сұраныстарды жүктеу мүмкін болмады.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleResponse = (athleteId, status) => {
        const promise = axios.put('/api/users/coach/respond-request', { athleteId, status })
            .then(() => {
                fetchRequests(); // Re-fetch on success
            });

        toast.promise(promise, {
            loading: 'Жауап жіберілуде...',
            success: <b>Жауап сәтті жіберілді!</b>,
            error: (err) => err.response?.data?.message || <b>Операцияны орындау кезінде қате.</b>
        });
    };

    return (
        <div className="container coach-dashboard-grid">
            <nav className="coach-dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/coach/dashboard">Басты бет</Link></li>
                    <li><Link to="/coach/my-athletes">Менің спортшыларым</Link></li>
                    <li><Link to="/coach/applications">Турнирлік өтінімдер</Link></li>
                    <li><Link to="/coach/requests" className="active">Спортшылардың сұраныстары</Link></li>
                </ul>
            </nav>
            <main className="coach-dashboard-content">
                <header className="page-header">
                    <h1>Спортшылардың сұраныстары</h1>
                    <p>Сіздің командаңызға қосылғысы келетін спортшылардың тізімі.</p>
                </header>

                {loading && <div className="loading-message">Жүктелуде...</div>}
                {error && <div className="error-message">{error}</div>}

                {!loading && !error && (
                    <div className="list-container athletes-container">
                        {requests.length > 0 ? requests.map(req => (
                            <div key={req._id} className="athlete-card-details">
                                <div className="card-header">
                                    <h3>{req.firstName} {req.lastName}</h3>
                                    <div className="card-header-actions">
                                        <button onClick={() => handleResponse(req._id, 'approved')} className="action-btn success-btn" title="Қабылдау">
                                            <Check size={20} />
                                        </button>
                                        <button onClick={() => handleResponse(req._id, 'rejected')} className="action-btn danger-btn" title="Бас тарту">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="profile-fields-grid compact">
                                    <div className="profile-field compact">
                                        <div className="profile-field__icon"><Mail size={16}/></div>
                                        <div>
                                            <div className="profile-field__label">Email</div>
                                            <div className="profile-field__value">{req.email}</div>
                                        </div>
                                    </div>
                                    <div className="profile-field compact">
                                        <div className="profile-field__icon"><Shield size={16}/></div>
                                        <div>
                                            <div className="profile-field__label">Клуб</div>
                                            <div className="profile-field__value">{req.club?.name || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="profile-field compact">
                                        <div className="profile-field__icon"><MapPin size={16}/></div>
                                        <div>
                                            <div className="profile-field__label">Город</div>
                                            <div className="profile-field__value">{req.city || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">
                                <p>Қазіргі уақытта жаңа сұраныстар жоқ.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AthleteRequestsPage;
