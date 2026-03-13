import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader, ChevronLeft, FileText, Users, Settings, LayoutGrid } from 'lucide-react';
import './ManageTournamentPage.css';

import ApplicationsTab from './tabs/ApplicationsTab';
import GridsTab from './tabs/GridsTab';
import ReportsTab from './tabs/ReportsTab';
import SettingsTab from './tabs/SettingsTab';

const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return userInfo ? userInfo.token : null;
};

const ManageTournamentPage = () => {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('applications');

    const fetchTournament = useCallback(async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${getToken()}` } };
            const { data } = await axios.get(`/api/tournaments/${id}`, config);
            setTournament(data);
        } catch (error) {
            toast.error('Турнир деректерін жүктеу мүмкін болмады.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTournament();
    }, [fetchTournament]);

    const handleTournamentUpdate = (updatedTournament) => {
        setTournament(updatedTournament);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'applications':
                return <ApplicationsTab />;
            case 'grids':
                return <GridsTab />;
            case 'reports':
                return <ReportsTab />;
            case 'settings':
                return <SettingsTab tournament={tournament} onTournamentUpdate={handleTournamentUpdate} />;
            default:
                return <ApplicationsTab />;
        }
    };

    if (loading) {
        return <div className="loader-container"><Loader className="animate-spin" size={48} /></div>;
    }

    if (!tournament) {
        return <div className="error-container">Турнир табылмады.</div>;
    }

    return (
        <div className="manage-tournament-container">
             <div className="page-header">
                <a href="/admin/tournaments" className="back-link">
                    <ChevronLeft size={24} />
                    <span>Турнирлер тізіміне</span>
                </a>
                <h1>{tournament.name}</h1>
                <p>Турнирді басқару: өтінімдер, торлар, хаттамалар және баптаулар.</p>
            </div>

            <nav className="tab-navigation">
                <button onClick={() => setActiveTab('applications')} className={activeTab === 'applications' ? 'tab-link active' : 'tab-link'}><Users size={16}/>Өтінімдер</button>
                <button onClick={() => setActiveTab('grids')} className={activeTab === 'grids' ? 'tab-link active' : 'tab-link'}><LayoutGrid size={16}/>Торлар</button>
                <button onClick={() => setActiveTab('reports')} className={activeTab === 'reports' ? 'tab-link active' : 'tab-link'}><FileText size={16}/>Хаттамалар</button>
                <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'tab-link active' : 'tab-link'}><Settings size={16}/>Баптаулар</button>
            </nav>

            <div className="tab-content">
                 {renderTabContent()}
            </div>
        </div>
    );
};

export default ManageTournamentPage;
