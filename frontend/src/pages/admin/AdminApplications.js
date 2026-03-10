
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FileText, Search, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import './AdminApplications.css';

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchApplications = async () => {
        try {
            setLoading(true);
            // НАҚТЫ API СҰРАНЫСЫ
            const { data } = await axios.get('/api/applications');
            setApplications(data);
        } catch (error) {
            const message = error.response?.data?.message || 'Өтінімдерді жүктеу кезінде қате пайда болды.';
            toast.error(message);
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const filteredApplications = applications.filter(app =>
        (app.tournament?.name.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (`${app.coach?.user?.firstName || ''} ${app.coach?.user?.lastName || ''}`.toLowerCase()).includes(searchTerm.toLowerCase())
    );

    const getStatusComponent = (status) => {
        const statusMap = {
            PENDING: { icon: <Clock size={16} />, text: 'Күтілуде', className: 'status-pending' },
            APPROVED: { icon: <CheckCircle size={16} />, text: 'Қабылданды', className: 'status-approved' },
            REJECTED: { icon: <XCircle size={16} />, text: 'Қабылданбады', className: 'status-rejected' },
        };
        const currentStatus = statusMap[status] || statusMap.PENDING;
        return (
            <span className={`status-badge ${currentStatus.className}`}>
                {currentStatus.icon}
                <span>{currentStatus.text}</span>
            </span>
        );
    };

    return (
        <div className="admin-applications admin-container">
            <header className="admin-applications-header">
                <h1><FileText size={32} /> Турнирге Өтінімдер</h1>
            </header>

            <div className="table-controls">
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Турнир немесе тренер бойынша іздеу..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-indicator">Жүктелуде...</div>
            ) : (
                <div className="applications-table-container">
                    <table className="applications-table">
                        <thead>
                            <tr>
                                <th>Турнир</th>
                                <th>Команда (Тренер)</th>
                                <th>Спортшылар саны</th>
                                <th>Статус</th>
                                <th>Әрекеттер</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.length > 0 ? filteredApplications.map(app => (
                                <tr key={app._id}>
                                    <td>{app.tournament?.name || 'Турнир аты жоқ'}</td>
                                    <td>{app.coach?.user ? `${app.coach.user.firstName} ${app.coach.user.lastName}` : 'Тренер жоқ'}</td>
                                    <td>{app.athletes?.length || 0}</td>
                                    <td>{getStatusComponent(app.status)}</td>
                                    <td className="action-buttons">
                                        <Link to={`/admin/applications/${app._id}`} className="btn-action btn-view" title="Өтінімді қарау">
                                            <Eye size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="no-results">Өтінімдер табылмады.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminApplications;
