import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Loader, Eye, Trash2 } from 'lucide-react';
import CreateTournamentModal from './CreateTournamentModal';
import './AdminTournaments.css';

const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return userInfo ? userInfo.token : null;
};

const AdminTournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchTournaments = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            const { data } = await axios.get('/api/tournaments/admin', config);
            setTournaments(data);
        } catch (error) {
            toast.error('Турнирлерді жүктеу сәтсіз аяқталды.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const handleTournamentCreated = () => {
        fetchTournaments();
    };

    const handleDelete = async (id) => {
        const tournamentToDelete = tournaments.find(t => t._id === id);
        if (!tournamentToDelete) return;

        const confirm = window.prompt(`Жою үшін турнир атауын енгізіңіз: ${tournamentToDelete.name}`);
        
        if (confirm === tournamentToDelete.name) {
            try {
                await axios.delete(`/api/tournaments/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
                toast.success('Турнир сәтті жойылды.');
                fetchTournaments();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Жою кезінде қате пайда болды.');
            }
        }
    };

    return (
        <div className="admin-tournaments-container">
            <div className="tournaments-header">
                <div>
                    <h1>Турнирлерді басқару</h1>
                    <p>Жүйедегі барлық турнирлерді қарау, жасау, мұрағаттау және жою.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="create-tournament-btn">
                    <Plus size={20} />
                    <span>Турнир құру</span>
                </button>
            </div>

            {loading ? (
                <div className="loader-container"><Loader className="animate-spin"/></div>
            ) : (
                <div className="tournaments-list">
                    <div className="list-header">
                        <div className="header-item name">Турнир атауы</div>
                        <div className="header-item dates">Өткізу күндері</div>
                        <div className="header-item status">Мәртебесі</div>
                        <div className="header-item actions">Әрекеттер</div>
                    </div>
                    {tournaments.length > 0 ? (
                        tournaments.map(tournament => (
                            <div className="list-item" key={tournament._id}>
                                <div className="item-cell name">{tournament.name}</div>
                                <div className="item-cell dates">
                                    {new Date(tournament.startDate).toLocaleDateString()} -
                                    {new Date(tournament.endDate).toLocaleDateString()}
                                </div>
                                <div className="item-cell status">
                                    <span className={`status-badge status-${tournament.status.toLowerCase()}`}>
                                        {tournament.status}
                                    </span>
                                </div>
                                <div className="item-cell actions">
                                    <button onClick={() => navigate(`/admin/tournaments/manage/${tournament._id}`)} className="action-btn view-btn">
                                        <Eye size={16} />
                                        <span>Басқару</span>
                                    </button>
                                    <button onClick={() => handleDelete(tournament._id)} className="action-btn delete-btn">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-tournaments-message">
                            <p>Турнирлер әлі құрылмаған.</p>
                            <span>Бірінші турнирді қосу үшін "Турнир құру" түймесін басыңыз.</span>
                        </div>
                    )}
                </div>
            )}

            <CreateTournamentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onTournamentCreated={handleTournamentCreated} 
            />
        </div>
    );
};

export default AdminTournaments;
