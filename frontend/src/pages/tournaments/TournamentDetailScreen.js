import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom'; // <-- Импортируем Link
import { getTournamentById, generateGrid } from '../../store/tournamentSlice';
import GridDisplay from '../../components/tournaments/GridDisplay';

const TournamentDetailScreen = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { tournament, loading, error } = useSelector((state) => state.tournaments);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getTournamentById(id));
    }, [dispatch, id]);

    // Проверяем, зарегистрирован ли ТЕКУЩИЙ пользователь (если он спортсмен)
    const isCurrentUserRegistered = tournament?.participants.some(p => p.user._id === user?._id);

    // --- НОВАЯ ЛОГИКА ---
    // Условия для отображения кнопки управления регистрацией для тренера
    const canManageRegistration = user?.role === 'coach' && tournament?.status === 'REGISTRATION_OPEN';

    // Условие для генерации сетки (остается без изменений)
    const canGenerateGrid = user?.role === 'Admin' && tournament?.status === 'REGISTRATION_CLOSED' && (!tournament.grid || tournament.grid.length === 0);

    const handleGenerateGrid = () => {
        dispatch(generateGrid(id));
    };

    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {tournament && (
                <div>
                    <h1>{tournament.name}</h1>
                    <p>Date: {new Date(tournament.date).toLocaleDateString()}</p>
                    <p>Location: {tournament.location}</p>
                    <p>Registration Deadline: {new Date(tournament.registrationDeadline).toLocaleDateString()}</p>
                    <p>Status: {tournament.status}</p>

                    {/* --- ИЗМЕНЕНИЯ -- */}
                    {/* Убираем старую форму регистрации для спортсменов */}

                    {/* Если пользователь - спортсмен, показываем ему статус регистрации */}
                    {user?.role === 'athlete' && isCurrentUserRegistered && (
                        <p style={{ color: 'green', fontWeight: 'bold' }}>Вы зарегистрированы на этот турнир.</p>
                    )}
                    {user?.role === 'athlete' && !isCurrentUserRegistered && tournament?.status === 'REGISTRATION_OPEN' && (
                        <p style={{ color: 'blue' }}>Для регистрации на турнир обратитесь к своему тренеру.</p>
                    )}

                    {/* Если пользователь - тренер, показываем ему кнопку для регистрации */}
                    {canManageRegistration && (
                        <Link to={`/tournaments/${id}/register-athlete`} className="f-btn-main">
                            Зарегистрировать спортсмена
                        </Link>
                    )}

                    {/* Кнопка генерации сетки для админа */}
                    {canGenerateGrid && (
                        <div>
                            <button onClick={handleGenerateGrid} disabled={loading}>
                                Generate Grid
                            </button>
                        </div>
                    )}

                    <h2>Participants</h2>
                    {tournament.participants.length > 0 ? (
                        tournament.participants.map((participant) => (
                            <div key={participant._id}>
                                <p>{participant.user.firstName} {participant.user.lastName} - {participant.weightCategory}kg, {participant.ageCategory} y.o.</p>
                            </div>
                        ))
                    ) : (
                        <p>No participants yet.</p>
                    )}

                    {tournament.grid && tournament.grid.length > 0 && (
                        <GridDisplay grid={tournament.grid} tournamentId={tournament._id} />
                    )}
                </div>
            )}
        </div>
    );
};

export default TournamentDetailScreen;
