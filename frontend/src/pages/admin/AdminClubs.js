import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getClubs, deleteClub } from '../../store/clubSlice';
import './AdminClubs.css';

const AdminClubs = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { clubs, loading, error } = useSelector(state => state.clubs);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(getClubs());
    }, [dispatch]);

    const deleteHandler = (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот клуб? Это действие нельзя будет отменить.')) {
            dispatch(deleteClub(id));
        }
    };

    const viewHandler = (id) => {
        navigate(`/admin/clubs/${id}`);
    };

    const filteredClubs = clubs.filter(club =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-clubs-container">
            <h1>Клубтар</h1>

            <div className="content-block">
                <div className="toolbar">
                    <input
                        type="text"
                        placeholder="Клубты іздеу..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <p>Загрузка...</p>
                ) : error ? (
                    <p>Ошибка: {error}</p>
                ) : (
                    <table className="clubs-table">
                        <thead>
                            <tr>
                                <th>Атауы (Название)</th>
                                <th>Тренер</th>
                                <th>Телефон тренера</th>
                                <th>Спортсмендер саны</th>
                                <th>Аймақ (Регион)</th>
                                <th>Әрекеттер (Действия)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClubs.map(club => (
                                <tr key={club._id}>
                                    <td>{club.name || '—'}</td>
                                    <td>{club.coachName || '—'}</td>
                                    <td>{club.coachPhone || '—'}</td>
                                    <td>{club.athleteCount !== undefined ? club.athleteCount : 0}</td>
                                    <td>{club.region || '—'}</td>
                                    <td className="action-buttons">
                                        <button 
                                            className="action-btn view-btn"
                                            onClick={() => viewHandler(club._id)}
                                        >
                                            👁️
                                        </button>
                                        <button 
                                            className="action-btn delete-btn" 
                                            onClick={() => deleteHandler(club._id)}
                                        >
                                            🗑️
                                        </button>
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

export default AdminClubs;