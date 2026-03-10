
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, PlusCircle, Edit, Trash2, Eye, Search, BarChart2, Users, Shield, Clock } from 'lucide-react';
import './AdminTournaments.css'; 

// Статистикалық карточка компоненті
const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card" style={{ borderBottomColor: color }}>
        <div className="stat-card-icon" style={{ backgroundColor: color }}>
            {icon}
        </div>
        <div className="stat-card-info">
            <p>{title}</p>
            <span>{value}</span>
        </div>
    </div>
);

const AdminTournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/tournaments');
            setTournaments(data);
        } catch (error) {
            toast.error('Турнирлерді жүктеу кезінде қате пайда болды.');
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    // Статистиканы есептеу
    const stats = useMemo(() => {
        const total = tournaments.length;
        const openForRegistration = tournaments.filter(t => t.status === 'REGISTRATION_OPEN').length;
        const upcoming = tournaments.filter(t => new Date(t.date) > new Date() && t.status !== 'COMPLETED').length;
        // Болашақта бұл деректерді backend-тен аламыз
        const totalParticipants = "N/A"; 
        return { total, openForRegistration, upcoming, totalParticipants };
    }, [tournaments]);

    const handleDelete = async (id) => {
        if (window.confirm('Сіз осы турнирді жойғыңыз келетініне сенімдісіз бе? Бұл әрекетті қайтару мүмкін емес.')) {
            const deletePromise = axios.delete(`/api/tournaments/${id}`)
                .then(() => {
                    fetchTournaments();
                    return 'Турнир сәтті жойылды';
                })
                .catch(err => {
                    throw new Error(err.response?.data?.message || 'Турнирді жою кезінде қате.');
                });

            toast.promise(deletePromise, {
                loading: 'Турнир жойылуда...',
                success: (message) => <b>{message}</b>,
                error: (err) => <b>{err.toString()}</b>,
            });
        }
    };
    
    const filteredTournaments = tournaments.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-tournaments admin-container">
            <header className="admin-tournaments-header">
                <h1><Calendar size={32} /> Турнирлерді басқару</h1>
            </header>

            {/* --- Статистикалық карточкалар --- */}
             <div className="stats-cards-grid">
                <StatCard title="Жалпы турнирлер" value={stats.total} icon={<BarChart2 size={24} />} color="#38BDF8" />
                <StatCard title="Тіркелуге ашық" value={stats.openForRegistration} icon={<Shield size={24} />} color="#22C55E" />
                <StatCard title="Алдағы" value={stats.upcoming} icon={<Clock size={24} />} color="#F59E0B" />
                <StatCard title="Барлық қатысушылар" value={stats.totalParticipants} icon={<Users size={24} />} color="#8B5CF6" />
            </div>

            <div className="table-controls">
                 <div className="search-bar">
                    <Search size={20} />
                    <input 
                        type="text" 
                        placeholder="Аты немесе орны бойынша іздеу..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Link to="/admin/tournaments/create" className="btn-primary">
                    <PlusCircle size={20} />
                    <span>Жаңа турнир құру</span>
                </Link>
            </div>

            {loading ? (
                <div className="loading-indicator">Жүктелуде...</div>
            ) : (
                <div className="tournaments-table-container">
                    <table className="tournaments-table">
                        <thead>
                            <tr>
                                <th>Атауы</th>
                                <th>Күні</th>
                                <th>Орны</th>
                                <th>Тіркелу мерзімі</th>
                                <th>Статус</th>
                                <th>Әрекеттер</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTournaments.length > 0 ? filteredTournaments.map(tourney => (
                                <tr key={tourney._id}>
                                    <td>{tourney.name}</td>
                                    <td>{new Date(tourney.date).toLocaleDateString()}</td>
                                    <td>{tourney.location}</td>
                                    <td>{new Date(tourney.registrationDeadline).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge status-${tourney.status.toLowerCase()}`}>
                                            {tourney.status}
                                        </span>
                                    </td>
                                    <td className="action-buttons">
                                        <Link to={`/tournaments/${tourney._id}`} className="btn-action btn-view" title="Толығырақ">
                                            <Eye size={18} />
                                        </Link>
                                        <Link to={`/admin/tournaments/edit/${tourney._id}`} className="btn-action btn-edit" title="Өңдеу">
                                            <Edit size={18} />
                                        </Link>
                                        <button onClick={() => handleDelete(tourney._id)} className="btn-action btn-delete" title="Жою">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="no-results">Іздеу нәтижелері бойынша турнирлер табылмады.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminTournaments;
