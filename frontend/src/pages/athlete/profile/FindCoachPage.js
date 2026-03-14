
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import '../dashboard/AthleteDashboard.css'; 
import { UserPlus } from 'lucide-react';

const FindCoachPage = () => {
    const [coaches, setCoaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get('/api/users/coaches');
                setCoaches(data);
            } catch (err) {
                setError("Жаттықтырушылар тізімін алу кезінде қате.");
            } finally {
                setLoading(false);
            }
        };
        fetchCoaches();
    }, []);

    const handleRequest = (coachId) => {
        const promise = axios.post('/api/users/athlete/send-request', { coachId })
            .then(response => response.data.message);

        toast.promise(promise, {
            loading: 'Сұраныс жіберілуде...',
            success: (message) => <b>{message}</b>,
            error: (err) => <b>{err.response?.data?.message || "Сұраныс жіберу мүмкін болмады."}</b>
        });
    };

    return (
        <div className="container athlete-dashboard-grid">
            <nav className="athlete-dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/athlete/dashboard">Басты бет</Link></li>
                    <li><Link to="/athlete/my-tournaments">Менің турнирлерім</Link></li>
                    {/* --- ДОБАВЛЕН НОВЫЙ ПУНКТ МЕНЮ --- */}
                    <li><Link to="/athlete/results">Нәтижелер тарихы</Link></li>
                    <li><Link to="/athlete/find-coach" className="active">Жаттықтырушы табу</Link></li>
                </ul>
            </nav>
            <main className="athlete-dashboard-content">
                <header className="page-header">
                    <h1>Жаттықтырушы табу</h1>
                    <p>Қосылуға болатын жаттықтырушылардың тізімі.</p>
                </header>

                {loading && <p>Жүктелуде...</p>}
                {error && <div className="error-message">{error}</div>}

                {!loading && !error && (
                    <div className="list-container">
                        {coaches.length > 0 ? coaches.map(coach => (
                            <div key={coach._id} className="item-card">
                                <div className="item-card__info">
                                    <h3>{coach.firstName} {coach.lastName}</h3>
                                    <p>Email: {coach.email}</p>
                                </div>
                                <button onClick={() => handleRequest(coach._id)} className="btn btn-primary">
                                    <UserPlus size={16} style={{marginRight: '8px'}}/>
                                    Сұраныс жіберу
                                </button>
                            </div>
                        )) : (
                            <div className="empty-state">
                                <p>Қазіргі уақытта жаттықтырушылар қолжетімді емес.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default FindCoachPage;
