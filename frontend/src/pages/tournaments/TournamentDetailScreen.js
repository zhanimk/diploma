import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getTournamentById, registerForTournament, generateGrid } from '../../store/tournamentSlice';
import GridDisplay from '../../components/tournaments/GridDisplay'; // Import GridDisplay

const TournamentDetailScreen = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { tournament, loading, error } = useSelector((state) => state.tournaments);
    const { user } = useSelector((state) => state.auth);

    const [weightCategory, setWeightCategory] = useState('');
    const [ageCategory, setAgeCategory] = useState('');

    useEffect(() => {
        dispatch(getTournamentById(id));
    }, [dispatch, id]);

    const isRegistered = tournament?.participants.some(p => p.user._id === user?._id);

    const handleRegister = (e) => {
        e.preventDefault();
        dispatch(registerForTournament({ id, weightCategory, ageCategory }));
    };

    const handleGenerateGrid = () => {
        dispatch(generateGrid(id));
    };

    const canRegister = user?.role === 'Athlete' && tournament?.status === 'Registration Open' && !isRegistered;
    const canGenerateGrid = user?.role === 'Admin' && tournament?.status === 'Registration Closed' && (!tournament.grid || tournament.grid.length === 0);

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

                    {canRegister && (
                        <form onSubmit={handleRegister}>
                            <h3>Register for this Tournament</h3>
                            <div>
                                <label>Weight Category (kg):</label>
                                <input 
                                    type="number" 
                                    value={weightCategory} 
                                    onChange={(e) => setWeightCategory(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div>
                                <label>Age Category:</label>
                                <input 
                                    type="number" 
                                    value={ageCategory} 
                                    onChange={(e) => setAgeCategory(e.target.value)} 
                                    required 
                                />
                            </div>
                            <button type="submit" disabled={loading}>Register</button>
                        </form>
                    )}
                    {isRegistered && <p>You are already registered for this tournament.</p>}

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
