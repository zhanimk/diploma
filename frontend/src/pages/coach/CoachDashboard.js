import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Users, LogIn, Shield, Building, MapPin, ArrowRight } from 'lucide-react';
import { kazakhstanRegions } from '../../utils/kazakhstanRegions'; // Импортируем регионы
import './CoachDashboard.css';

// ... (StatCard component remains the same) ...
const StatCard = ({ icon, value, label, linkTo, colorClass }) => (
    <Link to={linkTo} className={`stat-card-v2 ${colorClass}`}>
        <div className="stat-card-v2__header">
            <div className="stat-card-v2__icon">{icon}</div>
            <span className="stat-card-v2__value">{value}</span>
        </div>
        <div className="stat-card-v2__body">
            <span className="stat-card-v2__label">{label}</span>
        </div>
        <div className="stat-card-v2__footer">
            <span>Толығырақ</span>
            <ArrowRight size={16} />
        </div>
    </Link>
);


// =========================================
//   CreateClub Component - CORRECTED
// =========================================
const CreateClub = ({ onClubCreated }) => {
    const [name, setName] = useState('');
    const [region, setRegion] = useState(''); // Changed from city to region
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateClub = async (e) => {
        e.preventDefault();
        if (!region) { // Check if a region is selected
            setError('Пожалуйста, выберите регион.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Send `name` and `region` to the backend
            await axios.post('/api/clubs', { name, region });
            onClubCreated();
        } catch (err) {
            setError(err.response?.data?.message || 'Клуб құру кезінде қате.');
        }
        setLoading(false);
    };

    return (
        <div className="create-club-container">
            <h2><Building size={28} /> Сіздің клубыңыз жоқ</h2>
            <p>Жұмысты бастау үшін алдымен спорт клубын құрыңыз. Спортшылар сіздің клубыңызға қосылу туралы өтініш бере алады.</p>
            {error && <div className="error-alert">{error}</div>}
            <form onSubmit={handleCreateClub} className="create-club-form">
                <div className="input-group"><div className="icon-wrapper"><Building size={18} /></div><input type="text" placeholder="Клуб атауы" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div className="input-group">
                    <div className="icon-wrapper"><MapPin size={18} /></div>
                    <select value={region} onChange={(e) => setRegion(e.target.value)} required>
                        <option value="">Облысты таңдаңыз</option>
                        {kazakhstanRegions.map(reg => (
                            <option key={reg} value={reg}>{reg}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Құрылуда...' : 'Клуб құру'}</button>
            </form>
        </div>
    );
};


// ... (ClubDashboard component remains mostly the same, but we will adjust it) ...
const ClubDashboard = ({ clubData }) => {
    return (
        <>
            <header className="page-header">
                <div>
                    <h1>{clubData.club.name} клубының басқару панелі</h1>
                    {/* Display REGION instead of city */}
                    <span className="header-tag">{clubData.club.region}</span>
                </div>
            </header>

            <div className="stats-grid">
                 <StatCard 
                    icon={<Users size={24} />} 
                    value={clubData.approvedAthletesCount} 
                    label="Менің спортшыларым" 
                    linkTo="/coach/my-athletes"
                    colorClass="card-blue" 
                />
                <StatCard 
                    icon={<LogIn size={24} />} 
                    value={clubData.pendingAthletes.length} 
                    label="Спортшылардың сұраныстары" 
                    linkTo="/coach/requests"
                    colorClass="card-purple" 
                />
                <StatCard 
                    icon={<Shield size={24} />} 
                    value={0} 
                    label="Белсенді турнирлер" 
                    linkTo="/coach/applications"
                    colorClass="card-green" 
                />
            </div>
        </>
    );
};

// ... (Main CoachDashboard container remains the same) ...
const CoachDashboard = () => {
    const [clubData, setClubData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchClubData = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/clubs/my-club');
            setClubData(data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setClubData(null); 
            } else {
                setError('Dashboard data could not be loaded.');
                console.error("Error fetching club data:", err);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchClubData();
    }, [fetchClubData]);

    return (
        <div className="container coach-dashboard-grid">
             <nav className="coach-dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/coach/dashboard" className="active">Басты бет</Link></li>
                    <li><Link to="/profile">Профильді өңдеу</Link></li>
                    {clubData && <li><Link to="/coach/my-athletes">Менің спортшыларым</Link></li>}
                    {clubData && <li><Link to="/coach/applications">Турнирлік өтінімдер</Link></li>}
                    {clubData && <li><Link to="/coach/requests">Спортшылардың сұраныстары</Link></li>}
                </ul>
            </nav>
            <main className="coach-dashboard-content">
                {loading && <div className="loading-indicator">Жүктелуде...</div>}
                {error && <div className="error-alert">{error}</div>}
                {!loading && !error && (
                    clubData ? 
                    <ClubDashboard clubData={clubData} /> : 
                    <CreateClub onClubCreated={fetchClubData} />
                )}
            </main>
        </div>
    );
};


export default CoachDashboard;

