import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getClubById } from '../../store/clubSlice';
import './ClubDetails.css'; // We will create this file for styling

const ClubDetails = () => {
    const { id: clubId } = useParams();
    const dispatch = useDispatch();

    const { club, loadingDetails, errorDetails } = useSelector(state => state.clubs);

    useEffect(() => {
        dispatch(getClubById(clubId));
    }, [dispatch, clubId]);

    return (
        <div className="club-details-container">
            <Link to="/admin/clubs" className="back-link">← К списку клубов</Link>
            
            {loadingDetails ? (
                <p>Загрузка...</p>
            ) : errorDetails ? (
                <p className="error-message">Ошибка: {errorDetails}</p>
            ) : club ? (
                <div className="club-details-content">
                    <div className="main-info-card">
                        <h1>{club.name}</h1>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Тренер:</span>
                                <span className="info-value">{club.coachName || 'Не указан'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Телефон тренера:</span>
                                <span className="info-value">{club.coachPhone || 'Не указан'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Аймақ (Регион):</span>
                                <span className="info-value">{club.region || 'Не указан'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="athletes-card">
                        <h2>Спортсмены ({club.athletes ? club.athletes.length : 0})</h2>
                        {club.athletes && club.athletes.length > 0 ? (
                            <table className="athletes-table">
                                <thead>
                                    <tr>
                                        <th>Имя</th>
                                        <th>Фамилия</th>
                                        <th>Дата рождения</th>
                                        <th>Пол</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {club.athletes.map(athlete => (
                                        <tr key={athlete._id}>
                                            <td>{athlete.firstName}</td>
                                            <td>{athlete.lastName}</td>
                                            <td>{new Date(athlete.dateOfBirth).toLocaleDateString()}</td>
                                            <td>{athlete.gender === 'male' ? 'Мужской' : 'Женский'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>В этом клубе пока нет спортсменов.</p>
                        )}
                    </div>
                </div>
            ) : (
                <p>Клуб не найден.</p>
            )}
        </div>
    );
};

export default ClubDetails;
