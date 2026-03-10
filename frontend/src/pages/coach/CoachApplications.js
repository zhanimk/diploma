
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Shield, Calendar, Users, Eye, User, Weight } from 'lucide-react';
import './CoachDashboard.css'; // Main dashboard layout
import './MyAthletes.css';   // Specific styles for cards and actions

// ====================================================================
//  Individual Application Card Component
// ====================================================================
const ApplicationCard = ({ application }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Safely access tournament details
    const tournamentName = application.tournament?.name || 'Турнир не найден';
    const tournamentDate = application.tournament?.date ? new Date(application.tournament.date).toLocaleDateString() : 'Дата не указана';

    return (
        <div className="athlete-card-details"> {/* Reusing the main card style */}
            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Shield size={20} style={{ color: 'var(--brand-accent)' }} />
                    <div>
                        <h3>{tournamentName}</h3>
                        <p style={{ color: 'var(--text-secondary-dark)', margin: '0', fontSize: '0.9rem' }}>
                           {tournamentDate}
                        </p>
                    </div>
                </div>
                <div className="card-header-actions">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="action-btn" title={isExpanded ? "Свернуть" : "Показать спортсменов"}>
                        <Users size={18} style={{ marginRight: '8px' }}/> ({application.athletes.length})
                        <Eye size={18} style={{ marginLeft: '8px' }} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="profile-fields-grid compact"> {/* Reusing compact grid */}
                     {application.athletes.length > 0 ? application.athletes.map(athlete => (
                        <div key={athlete._id} className="profile-field compact"> 
                            <User size={16} className="profile-field__icon" />
                            <div className="profile-field__content">
                                <div className="profile-field__value">{athlete.firstName} {athlete.lastName}</div>
                                <div className="profile-field__label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                    <Weight size={12} /> {athlete.weight ? `${athlete.weight} кг` : 'Вес не указан'}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <p style={{ color: 'var(--text-secondary-dark)', padding: '0 1.5rem' }}>В этой заявке нет спортсменов.</p>
                    )}
                </div>
            )}
        </div>
    );
};


// ====================================================================
//  Main CoachApplications Component
// ====================================================================
const CoachApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/applications/coach-applications');
            setApplications(data);
        } catch (err) {
            setError("Өтінімдерді алу кезінде қате болды.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    return (
        <div className="container coach-dashboard-grid">
            <nav className="coach-dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/coach/dashboard">Басты бет</Link></li>
                    <li><Link to="/coach/my-athletes">Менің спортшыларым</Link></li>
                    <li><Link to="/coach/applications" className="active">Турнирлік өтінімдер</Link></li>
                    <li><Link to="/coach/requests">Қосылу сұраныстары</Link></li>
                </ul>
            </nav>
            <main className="coach-dashboard-content">
                <header className="page-header">
                    <h1>Турнирлік өтінімдер</h1>
                    <p>Сіздің спортшыларыңыз қатысатын турнирлерге өтінімдер.</p>
                </header>

                {loading && <div className="loading-message">Жүктелуде...</div>}
                {error && <div className="error-message">{error}</div>}

                {!loading && !error && (
                    <div className="athletes-container"> {/* Reusing the container style */}
                        {applications.length > 0 ? applications.map(app => (
                            <ApplicationCard key={app._id} application={app} />
                        )) : (
                            <div className="empty-state">
                                <p>Сіз әлі ешқандай турнирге өтінім бермегенсіз.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CoachApplications;
