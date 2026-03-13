import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getTournaments } from '../../store/tournamentSlice';
import { Loader, AlertTriangle, Calendar, MapPin } from 'lucide-react';
import './TournamentListScreen.css'; // Импортируем новый файл стилей

const TournamentCard = ({ tournament }) => {
    const getStatusClass = (status) => {
        switch (status) {
            case 'new':
                return 'status-new';
            case 'active':
                return 'status-active';
            case 'completed':
                return 'status-completed';
            default:
                return '';
        }
    };

    return (
        <div className="tournament-card">
            <div className="card-header">
                <h2>{tournament.name}</h2>
            </div>
            <div className="card-body">
                <div className="card-info-item">
                    <Calendar size={16} className="icon" />
                    <span>{new Date(tournament.date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="card-info-item">
                    <MapPin size={16} className="icon" />
                    <span>{tournament.location}</span>
                </div>
            </div>
            <div className="card-footer">
                <span className={`status-badge ${getStatusClass(tournament.status)}`}>
                    {tournament.status}
                </span>
                <Link to={`/tournaments/${tournament._id}`} className="details-button">
                    Подробнее
                </Link>
            </div>
        </div>
    );
};

const TournamentListScreen = () => {
    const dispatch = useDispatch();
    const { tournaments, loading, error } = useSelector((state) => state.tournaments);

    useEffect(() => {
        dispatch(getTournaments());
    }, [dispatch]);

    if (loading) {
        return <div className="loading-container"><Loader className="spinner" size={48} /></div>;
    }

    if (error) {
        return <div className="error-container"><AlertTriangle size={48} /><p>Ошибка при загрузке турниров: {error.message}</p></div>;
    }

    return (
        <div className="tournament-list-page">
            <div className="tournament-list-header">
                <h1>Все турниры</h1>
            </div>
            <div className="tournaments-grid">
                {tournaments.map((tournament) => (
                    <TournamentCard key={tournament._id} tournament={tournament} />
                ))}
            </div>
        </div>
    );
};

export default TournamentListScreen;
