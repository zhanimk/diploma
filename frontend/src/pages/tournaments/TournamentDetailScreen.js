
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getTournamentById } from '../../store/tournamentSlice';
import TournamentGridsTab from '../../components/tournaments/TournamentGridsTab';
import { Calendar, MapPin, Users, Info, BarChart2 } from 'lucide-react';
import './TournamentDetailScreen.css';

const TournamentDetailScreen = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'grids'

    const { tournament, loading, error } = useSelector((state) => state.tournaments);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getTournamentById(id));
    }, [dispatch, id]);

    if (loading) return <div className="loading-indicator">Жүктелуде...</div>;
    if (error) return <div className="error-indicator">Қате: {error.message || 'Турнирді жүктеу мүмкін болмады'}</div>;
    if (!tournament) return <div className="no-data-info">Турнир табылмады.</div>;
    
    // Условие для отображения кнопки управления регистрацией для тренера
    const canManageRegistration = user?.role === 'coach' && tournament?.status === 'REGISTRATION_OPEN';
    
    const renderContent = () => {
        if (activeTab === 'info') {
            return (
                <div className='tournament-info-content'>
                     <h2><Users size={22} /> Қатысушылар ({tournament.participants.length})</h2>
                     {tournament.participants.length > 0 ? (
                        <ul className='participants-list'>
                            {tournament.participants.map((participant) => (
                                <li key={participant._id}>
                                   {participant.user.firstName} {participant.user.lastName} - {participant.weightCategory} кг
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Тіркелген қатысушылар әлі жоқ.</p>
                    )}
                </div>
            );
        }
        if (activeTab === 'grids') {
            return <TournamentGridsTab />;
        }
    };
    
    const getStatusInfo = (status) => {
        const statusMap = {
            SCHEDULED: { text: 'Жоспарланған', className: 'status-scheduled' },
            REGISTRATION_OPEN: { text: 'Тіркелу ашық', className: 'status-open' },
            REGISTRATION_CLOSED: { text: 'Тіркелу жабық', className: 'status-closed' },
            ONGOING: { text: 'Жүріп жатыр', className: 'status-ongoing' },
            COMPLETED: { text: 'Аяқталды', className: 'status-completed' },
        };
        return statusMap[status] || { text: status.toUpperCase(), className: 'status-default' };
    };
    const statusInfo = getStatusInfo(tournament.status);

    return (
        <div className="tournament-detail-container public-container">
            <header className='tournament-header'>
                 <h1>{tournament.name}</h1>
                 <span className={`status-badge ${statusInfo.className}`}>{statusInfo.text}</span>
            </header>
            
            <div className="tournament-meta">
                <span><Calendar size={16}/> {new Date(tournament.date).toLocaleDateString('kk-KZ', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span><MapPin size={16}/> {tournament.location}</span>
            </div>

            {canManageRegistration && (
                <div className="coach-actions">
                     <Link to={`/tournaments/${id}/register-athlete`} className="btn btn-primary">
                        Спортшыны тіркеу
                    </Link>
                    <p>Өз командаңызды осы турнирге тіркеу үшін басыңыз.</p>
                </div>
            )}
            
            <div className="tabs">
                <button 
                    className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                   <Info size={18}/> Ақпарат
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'grids' ? 'active' : ''}`}
                    onClick={() => setActiveTab('grids')}
                >
                   <BarChart2 size={18}/> Сеткалар
                </button>
            </div>

            <div className="tab-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default TournamentDetailScreen;
