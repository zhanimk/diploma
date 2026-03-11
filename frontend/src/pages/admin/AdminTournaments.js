
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTournaments, deleteTournament } from '../../store/tournamentSlice';
import './AdminTournaments.css';
import './AdminDashboard.css'; // Стили для карточек

const AdminTournaments = () => {
    const dispatch = useDispatch();
    const { tournaments, loading, error } = useSelector((state) => state.tournaments);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(getTournaments());
    }, [dispatch]);

    const handleDelete = (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот турнир?')) {
            dispatch(deleteTournament(id));
        }
    };

    // Расчет статистики на основе загруженных данных
    const stats = {
        total: tournaments.length,
        open: tournaments.filter(t => new Date(t.registrationEndDate) > new Date()).length,
        upcoming: tournaments.filter(t => new Date(t.startDate) > new Date()).length,
    };

    const filteredTournaments = tournaments.filter(tournament =>
        tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-tournaments-container">
            <h2>Управление турнирами</h2>

            {/* Статистические карточки */}
            <div className="dashboard-cards">
                <div className="card">
                    <h3>Жалпы турнирлер</h3>
                    <p>{stats.total}</p>
                </div>
                <div className="card">
                    <h3>Тіркелуге ашық</h3>
                    <p>{stats.open}</p>
                </div>
                <div className="card">
                    <h3>Алдағы</h3>
                    <p>{stats.upcoming}</p>
                </div>
                <div className="card">
                    <h3>Барлық қатысушылар</h3>
                    <p>N/A</p> {/* Заглушка, как на скриншоте */}
                </div>
            </div>

            {/* Панель инструментов */}
            <div className="tournaments-toolbar">
                <input
                    type="text"
                    placeholder="Іздеу..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Link to="/admin/tournaments/create" className="create-tournament-button">+ Жаңа турнир құру</Link>
            </div>

            {/* Список турниров */}
            <div className="tournaments-list-container">
                {loading ? (
                    <p>Загрузка...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>Ошибка: {error.message || 'Не удалось загрузить данные'}</p>
                ) : (
                    <table className="tournaments-table">
                        <thead>
                            <tr>
                                <th>Атауы</th>
                                <th>Күні</th>
                                <th>Орны</th>
                                <th>Статус</th>
                                <th>Әрекеттер</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTournaments.map(tournament => (
                                <tr key={tournament._id}>
                                    <td>{tournament.name}</td>
                                    <td>{new Date(tournament.startDate).toLocaleDateString()}</td>
                                    <td>{tournament.location}</td>
                                    <td>{tournament.status || 'N/A'}</td>
                                    <td className="action-buttons">
                                        <Link to={`/admin/tournaments/edit/${tournament._id}`} className="action-btn edit-btn">✏️</Link>
                                        <button onClick={() => handleDelete(tournament._id)} className="action-btn delete-btn">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminTournaments;

