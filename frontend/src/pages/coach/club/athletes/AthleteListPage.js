import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import './AthleteListPage.css'; // Импортируем новый файл стилей
import AthleteCard from '../../../../components/athlete/AthleteCard';


const AthleteListPage = () => {
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAthletes = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/clubs/my-athletes');
            setAthletes(data);
        } catch (err) {
            setError("Спортшылар туралы деректерді алу кезінде қате.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAthletes();
    }, [fetchAthletes]);

    return (
        <div className="container coach-dashboard-grid">
            <nav className="coach-dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/coach/dashboard">Басты бет</Link></li>
                    <li><Link to="/profile">Профильді өңдеу</Link></li>
                    <li><Link to="/coach/my-athletes" className="active">Менің спортшыларым</Link></li>
                    <li><Link to="/coach/applications">Турнирлік өтінімдер</Link></li>
                    <li><Link to="/coach/requests">Спортшылардың сұраныстары</Link></li>
                </ul>
            </nav>
            <main className="coach-dashboard-content">
                <header className="page-header my-athletes-header">
                    <div>
                        <h1>Менің спортшыларым</h1>
                        <p>Бұл жерде сіздің клубыңызда бекітілген спортшылардың тізімі көрсетілген.</p>
                    </div>
                    <Link to="/coach/register-athlete" className="btn-primary btn-add-athlete">
                        <UserPlus size={20} />
                        <span>Жаңа спортшыны қосу</span>
                    </Link>
                </header>

                {loading && <div className="loading-indicator">Жүктелуде...</div>}
                {error && <div className="error-alert">{error}</div>}

                {!loading && !error && (
                    <div className="athlete-list-container">
                        {athletes.length > 0 ? (
                            athletes.map(athlete => <AthleteCard key={athlete._id} athlete={athlete} />)
                        ) : (
                            <div className="empty-state-card">
                                <h3>Спортшылар жоқ</h3>
                                <p>Сіздің клубыңызда әлі бекітілген спортшылар жоқ. <br/>Жаңа спортшыны тіркеу үшін жоғарыдағы батырманы басыңыз.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AthleteListPage;
