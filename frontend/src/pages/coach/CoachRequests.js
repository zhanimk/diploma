
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Check, X, User, Mail, Shield, MapPin } from 'lucide-react';
import './CoachDashboard.css'; // Main dashboard layout
import './MyAthletes.css';   // Specific styles for cards and actions

const CoachRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/users/coach/student-requests', {
                headers: { 'Cache-Control': 'no-cache' },
            });
            setRequests(data.filter(req => req.status === 'pending'));
        } catch (err) {
            setError('Сұраныстарды алу кезінде қате болды.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleResponse = (requestId, status) => {
        const promise = axios.put('/api/users/coach/respond-request', { requestId, status })
            .then(() => fetchRequests()); // Re-fetch on success

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
                    <li><Link to="/coach/requests" className="active">Қосылу сұраныстары</Link></li>
                </ul>
            </nav>
            <main className="coach-dashboard-content">
                <header className="page-header">
                    <h1>Кіруге сұраныстар</h1>
                    <p>Сіздің командаңызға қосылғысы келетін спортшылардың тізімі.</p>
                </header>

                {loading && <div className="loading-message">Жүктелуде...</div>}
                {error && <div className="error-message">{error}</div>}

                {!loading && !error && (
                    <div className="list-container athletes-container"> {/* Use same container for consistency */}
                        {requests.length > 0 ? requests.map(req => (
                            req.student ? (
                                <div key={req._id} className="athlete-card-details"> {/* Reusing card style */}
                                    <div className="card-header">
                                        <h3>{req.student.firstName} {req.student.lastName}</h3>
                                        <div className="card-header-actions">
                                            <button onClick={() => handleResponse(req._id, 'accepted')} className="action-btn success-btn" title="Қабылдау">
                                                <Check size={20} />
                                            </button>
                                            <button onClick={() => handleResponse(req._id, 'rejected')} className="action-btn danger-btn" title="Бас тарту">
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Additional info for context */}
                                    <div className="profile-fields-grid compact">
                                        <div className="profile-field compact">
                                            <div className="profile-field__icon"><Mail size={16}/></div>
                                            <div>
                                                <div className="profile-field__label">Email</div>
                                                <div className="profile-field__value">{req.student.email}</div>
                                            </div>
                                        </div>
                                        <div className="profile-field compact">
                                            <div className="profile-field__icon"><Shield size={16}/></div>
                                            <div>
                                                <div className="profile-field__label">Клуб</div>
                                                <div className="profile-field__value">{req.student.club || 'N/A'}</div>
                                            </div>
                                        </div>
                                        <div className="profile-field compact">
                                            <div className="profile-field__icon"><MapPin size={16}/></div>
                                            <div>
                                                <div className="profile-field__label">Город</div>
                                                <div className="profile-field__value">{req.student.city || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null
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

export default CoachRequests;
