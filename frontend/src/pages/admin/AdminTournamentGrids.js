
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart2, Calendar } from 'lucide-react';
import './AdminTournamentGrids.css';

const RoundRobinGrid = ({ grid }) => {
    return (
        <div className="grid-container round-robin-grid">
            <h4>Круговая система</h4>
            <table className="round-robin-table">
                <thead>
                    <tr>
                        <th>Спортсмен</th>
                        {grid.athletes.map(a => <th key={a._id}>{a.lastName}</th>)}
                        <th>Очки</th>
                    </tr>
                </thead>
                <tbody>
                    {grid.athletes.map(a => (
                        <tr key={a._id}>
                            <td>{a.firstName} {a.lastName}</td>
                            {grid.athletes.map(opponent => <td key={opponent._id}>-</td>)}
                             <td>0</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const OlympicGrid = ({ grid }) => {
    return (
        <div className="grid-container olympic-grid">
             <h4>Олимпийская система</h4>
             <p>Отображение олимпийской сетки находится в разработке.</p>
        </div>
    );
};

const AdminTournamentGrids = () => {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [grids, setGrids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeGrid, setActiveGrid] = useState(null);

    useEffect(() => {
        const fetchGrids = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`/api/tournaments/${id}/grids`);
                setTournament(data.tournament);
                setGrids(data.grids);
                if (data.grids.length > 0) {
                    setActiveGrid(data.grids[0]);
                }
            } catch (error) {
                toast.error('Сеткаларды жүктеу кезінде қате пайда болды.');
            } finally {
                setLoading(false);
            }
        };

        fetchGrids();
    }, [id]);

    if (loading) return <div className="loading-indicator">Жүктелуде...</div>;

    return (
        <div className="admin-grids-page admin-container">
            <header className="admin-grids-header">
                <div>
                    <h1 className="tournament-title"><Calendar size={30} /> {tournament?.name}</h1>
                    <p className="tournament-date">{new Date(tournament?.date).toLocaleDateString()}</p>
                </div>
            </header>

            <div className="grids-layout">
                <aside className="category-sidebar">
                    <h3><BarChart2 size={22}/> Категориялар ({grids.length})</h3>
                    <ul>
                        {grids.map(grid => (
                            <li 
                                key={grid._id} 
                                className={activeGrid?._id === grid._id ? 'active' : ''}
                                onClick={() => setActiveGrid(grid)}
                            >
                                {grid.categoryName}
                                <span className="athlete-count">({grid.athletes.length} қатысушы)</span>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="grid-display">
                    {activeGrid ? (
                        <div className="grid-content">
                            <h3>Сетка: {activeGrid.categoryName}</h3>
                            {activeGrid.gridType === 'ROUND_ROBIN' ? (
                                <RoundRobinGrid grid={activeGrid} />
                            ) : (
                                <OlympicGrid grid={activeGrid} />
                            )}
                        </div>
                    ) : (
                        <div className="no-grid-selected">
                            <p>Категорияны таңдаңыз</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminTournamentGrids;
