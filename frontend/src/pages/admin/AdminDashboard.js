import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './AdminDashboard.css';
import { FaUsers, FaClipboardList, FaTrophy, FaUserShield } from 'react-icons/fa';

const StatCard = ({ icon, label, value, color }) => (
    <div className="stat-card">
        <div className="stat-card-icon" style={{ backgroundColor: color }}>
            {icon}
        </div>
        <div className="stat-card-info">
            <span className="stat-card-value">{value}</span>
            <span className="stat-card-label">{label}</span>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                const { data } = await axios.get('/api/admin/stats', config);
                setStats(data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userInfo) {
            fetchStats();
        } else {
            setLoading(false);
        }
    }, [userInfo]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Әкімші панелі</h1>
                <p>Платформаны басқарудың негізгі орталығы</p>
            </header>

            {loading && <p>Loading statistics...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            {stats && (
                <div className="stats-grid">
                    <StatCard 
                        icon={<FaUsers size={24} />} 
                        label="Барлық пайдаланушылар" 
                        value={stats.totalUsers} 
                        color="#3B82F6"
                    />
                    <StatCard 
                        icon={<FaUserShield size={24} />} 
                        label="Клубтар" 
                        value={stats.totalClubs} 
                        color="#10B981"
                    />
                    <StatCard 
                        icon={<FaTrophy size={24} />} 
                        label="Турнирлер" 
                        value={stats.totalTournaments} 
                        color="#F97316"
                    />
                    <StatCard 
                        icon={<FaClipboardList size={24} />} 
                        label="Күтіп тұрған өтінімдер" 
                        value={stats.pendingApplications} 
                        color="#8B5CF6"
                    />
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
