import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getClubs, deleteClub } from '../../store/clubSlice';
import './AdminClubs.css';

const AdminClubs = () => {
    const dispatch = useDispatch();
    const { clubs, loading, error } = useSelector(state => state.clubs);
    const { userInfo } = useSelector(state => state.auth);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // We dispatch getClubs. The backend middleware will ensure only admins can get the data.
        dispatch(getClubs());
    }, [dispatch]);

    const deleteHandler = (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот клуб? Это действие нельзя будет отменить.')) {
            dispatch(deleteClub(id));
        }
    };

    const filteredClubs = clubs.filter(club =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // The main render logic. It relies on Redux state (loading, error, or data) 
    // to display the correct UI. This is robust and avoids race conditions.
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
                    // If the API call fails (e.g., due to auth), the error will be shown here.
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
                                        <button className="action-btn view-btn">👁️</button>
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