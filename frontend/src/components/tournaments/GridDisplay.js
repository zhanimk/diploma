import React from 'react';
import Match from './Match';

const GridDisplay = ({ grid, tournamentId }) => {
    if (!grid || grid.length === 0) {
        return <p>The grid has not been generated yet.</p>;
    }

    return (
        <div>
            <h2>Tournament Grid</h2>
            {grid.map(category => (
                <div key={category.category}>
                    <h3>{category.category}</h3>
                    {category.rounds.map((round, roundIndex) => (
                        <div key={roundIndex}>
                            <h4>Round {roundIndex + 1}</h4>
                            {round.matches.map(match => (
                                <Match 
                                    key={match._id}
                                    match={match} 
                                    tournamentId={tournamentId} 
                                    category={category.category}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default GridDisplay;
