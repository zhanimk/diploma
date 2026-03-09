import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateMatchResult } from '../../store/tournamentSlice';

const Match = ({ match, tournamentId, category }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);

    const handleWinnerSelect = (winnerId) => {
        if (user?.role === 'Judge') {
            dispatch(updateMatchResult({ id: tournamentId, category, matchId: match._id, winnerId }));
        }
    };

    const renderParticipant = (participant, isWinner) => {
        if (!participant) return <div>BYE</div>;
        
        const className = `match-participant ${isWinner ? 'winner' : ''}`;
        return (
            <div className={className} onClick={() => handleWinnerSelect(participant._id)}>
                {participant.firstName} {participant.lastName}
            </div>
        );
    };

    return (
        <div className="match">
            {renderParticipant(match.participant1, match.winner && match.winner === match.participant1?._id)}
            <div>vs</div>
            {renderParticipant(match.participant2, match.winner && match.winner === match.participant2?._id)}
        </div>
    );
};

export default Match;
