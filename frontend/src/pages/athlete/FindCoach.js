import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/authSlice';
import './Dashboard.css';
import { Search, UserPlus } from 'lucide-react';

const FindCoach = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [coaches, setCoaches] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                setLoading(true);
                // Предполагаем, что есть эндпоинт для получения всех тренеров
                const { data } = await axios.get('/api/users?role=coach');
                setCoaches(data);
                setError(null);
            } catch (err) {
                setError('Тренерлерді жүктей алмады. Желіні тексеріп, әрекетті қайталаңыз.');
                toast.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCoaches();
    }, [error]);

    const handleLinkCoach = async (coachId) => {
        const promise = axios.put('/api/users/profile/link-coach', { coachId }).then(res => {
            dispatch(setUser(res.data));
            return res.data; 
        });

        toast.promise(promise, {
            loading: 'Сұраныс жіберілуде...',
            success: <b>Сұраныс сәтті жіберілді! Жаттықтырушының растауын күтіңіз.</b>,
            error: (err) => err.response?.data?.message || 'Сұранысты жіберу кезінде қате орын алды.',
        });
    };

    const filteredCoaches = coaches.filter(coach =>
        coach.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container dashboard-grid">
            <nav className="dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/athlete/dashboard">Профиль</Link></li>
                    <li><Link to="/athlete/find-coach" className="active">Жаттықтырушыны табу</Link></li>
                    <li><Link to="/athlete/tournaments">Менің турнирлерім</Link></li>
                    <li><Link to="/athlete/history">Жарыс тарихы</Link></li>
                </ul>
            </nav>

            <div className="dashboard-content">
                <header className="dashboard-header">
                    <h2>Жаттықтырушыны табу</h2>
                    <p>Өз жаттықтырушыңызды табыңыз және оған тіркелуге сұраныс жіберіңіз.</p>
                </header>

                <div className="card list-container">
                    <div className="coach-search-header">
                        <div className="search-bar">
                            <Search size={20} className="search-bar__icon" />
                            <input 
                                type="text"
                                placeholder="Жаттықтырушының аты-жөнін іздеу..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <p>Жүктелуде...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : user.coachRequest ? (
                         <div className="centered-message">
                            <p>Сіз жаттықтырушыға сұраныс жібердіңіз. Растауды күтіңіз.</p>
                         </div>
                    ) : user.coach ? (
                         <div className="centered-message">
                            <p>Сіздің жаттықтырушыңыз бар. Жаңасын таңдау үшін ағымдағы байланысты үзу керек.</p>
                         </div>
                    ) : (
                        <ul className="coach-list">
                            {filteredCoaches.length > 0 ? (
                                filteredCoaches.map(coach => (
                                    <li key={coach._id} className="coach-item">
                                        <div className="coach-item__info">
                                            <span className="coach-item__name">{coach.firstName} {coach.lastName}</span>
                                            <span className="coach-item__meta">{coach.city || 'Қала көрсетілмеген'}</span>
                                        </div>
                                        <button onClick={() => handleLinkCoach(coach._id)} className="f-btn-main small">
                                            <UserPlus size={16} />
                                            <span>Сұраныс жіберу</span>
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <p>Ешқандай жаттықтырушы табылмады.</p>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindCoach;
