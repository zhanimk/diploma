import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getTournaments } from '../../store/tournamentSlice';

const TournamentListScreen = () => {
    const dispatch = useDispatch();
    const { tournaments, loading, error } = useSelector((state) => state.tournaments);

    useEffect(() => {
        dispatch(getTournaments());
    }, [dispatch]);

    return (
        <div>
            <h1>Tournaments</h1>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {tournaments.map((tournament) => (
                <div key={tournament._id}>
                    <h2>
                        <Link to={`/tournaments/${tournament._id}`}>{tournament.name}</Link>
                    </h2>
                    <p>Date: {new Date(tournament.date).toLocaleDateString()}</p>
                    <p>Location: {tournament.location}</p>
                    <p>Status: {tournament.status}</p>
                </div>
            ))}
        </div>
    );
};

export default TournamentListScreen;
