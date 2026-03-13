
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart2, Calendar, ArrowLeft, Zap } from 'lucide-react';
import './AdminTournamentGrids.css';

// Компоненты сеток (RoundRobinGrid, OlympicGrid) остаются без изменений
const RoundRobinGrid = ({ grid }) => {
    // ... (код компонента)
};
const OlympicGrid = ({ grid }) => {
    // ... (код компонента)
};


const AdminTournamentGrids = () => {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [grids, setGrids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [activeGrid, setActiveGrid] = useState(null);

    const fetchGrids = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/tournaments/${id}/grids`);
            setTournament(data.tournament);
            setGrids(data.grids);
            if (data.grids.length > 0) {
                // Если есть активная сетка, пытаемся найти ее и в новом списке
                setActiveGrid(prev => data.grids.find(g => g._id === prev?._id) || data.grids[0]);
            } else {
                setActiveGrid(null);
            }
        } catch (error) {
            toast.error('Сеткаларды жүктеу кезінде қате пайда болды.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchGrids();
    }, [fetchGrids]);

    const handleGenerateGrids = async () => {
        const isConfirmed = window.confirm('Сіз осы турнир үшін сеткаларды жасағыңыз келетініне сенімдісіз бе? Бұл әрекет бұрыннан бар сеткаларды қайта жазуы мүмкін.');
        if (!isConfirmed) return;

        setGenerating(true);
        const promise = axios.post(`/api/tournaments/${id}/generate-grids`)
            .then(res => {
                fetchGrids(); // После успешной генерации перезагружаем сетки
                return res.data.message || 'Сеткалар сәтті құрылды!';
            })
            .catch(err => {
                throw new Error(err.response?.data?.message || "Сеткаларды құру кезінде қате.");
            }) 
            .finally(() => {
                 setGenerating(false);
            });

        toast.promise(promise, {
            loading: 'Генерация процесі жүріп жатыр...',
            success: (message) => <b>{message}</b>,
            error: (err) => <b>{err.toString()}</b>,
        });
    };

    if (loading) return <div className="loading-indicator">Жүктелуде...</div>;

    return (
        <div className="admin-grids-page admin-container">
            <header className="admin-grids-header">
                 <Link to={`/admin/tournaments`} className="back-link"><ArrowLeft size={20} /> Артқа</Link>
                <div className='header-info'>
                    <h1 className="tournament-title"><Calendar size={30} /> {tournament?.name}</h1>
                    <p className="tournament-date">{new Date(tournament?.date).toLocaleDateString()}</p>
                </div>
                <div className="header-actions">
                    <button onClick={handleGenerateGrids} className="btn btn-primary" disabled={generating}>
                        <Zap size={18} /> {generating ? 'Генерация...' : 'Сеткаларды құру'}
                    </button>
                </div>
            </header>

            <div className="grids-layout">
                <aside className="category-sidebar">
                    <h3><BarChart2 size={22}/> Категориялар ({grids.length})</h3>
                     {grids.length === 0 && !loading && (
                        <div className="no-grids-info">
                            <p>Бұл турнирде әлі сеткалар жоқ.</p>
                            <p>Жоғарыдағы "Сеткаларды құру" батырмасын басып, оларды генерациялаңыз.</p>
                        </div>
                    )}
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
                             <BarChart2 size={50} />
                            <p>{grids.length > 0 ? 'Көру үшін категорияны таңдаңыз' : 'Генерацияны күтуде'}</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminTournamentGrids;

