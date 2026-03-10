
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AthleteDashboard.css'; 
import { User, Shield, Search, Star, Edit } from 'lucide-react'; // Убрали Weight, Pencil, Users. Добавили Edit.

const AthleteDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [coach, setCoach] = useState(null);
    const [loading, setLoading] = useState(true);
    const hasCoach = user && user.coach;

    useEffect(() => {
        const fetchCoach = async () => {
            if (hasCoach) {
                try {
                    const { data } = await axios.get(`/api/users/${user.coach}`);
                    setCoach(data);
                } catch (error) {
                    console.error("Тренер туралы ақпаратты алу кезінде қате:", error);
                }
            }
            setLoading(false);
        };
        fetchCoach();
    }, [user, hasCoach]);

    return (
        <div className="container athlete-dashboard-grid">
            <nav className="athlete-dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/athlete/dashboard" className="active">Басты бет</Link></li>
                    {/* НОВАЯ ССЫЛКА НА ПРОФИЛЬ */}
                    <li><Link to="/profile">Профильді өңдеу</Link></li>
                    <li><Link to="/athlete/my-tournaments">Менің турнирлерім</Link></li>
                    <li><Link to="/athlete/results">Нәтижелер тарихы</Link></li>
                    {!hasCoach && (
                        <li><Link to="/athlete/find-coach">Жаттықтырушы табу</Link></li>
                    )}
                </ul>
            </nav>

            <main className="athlete-dashboard-content">
                <header className="page-header">
                    <h1>Сәлем, {user ? user.firstName : 'Спортшы'}!</h1>
                    <p>Жеке кабинетке қош келдіңіз. Мұнда сіз өзіңіздің спорттық мансабыңызды басқара аласыз.</p>
                </header>

                {loading ? <p>Жүктелуде...</p> : (
                    <div className="list-container">
                        
                        {/* НОВАЯ КАРТОЧКА ПРОФИЛЯ */}
                        <div className="item-card">
                             <div className="item-card__info">
                                <h3><User size={18} style={{marginRight: '8px'}}/> Жеке деректер</h3>
                                <p>Жеке ақпаратыңызды қарап шығыңыз және жаңартыңыз.</p>
                            </div>
                            <Link to="/profile" className="btn btn-primary">
                                 <Edit size={16} style={{marginRight: '8px'}}/>
                                 Профильді өңдеу
                            </Link>
                        </div>

                        {hasCoach && coach && (
                            <div className="item-card">
                                <div className="item-card__info">
                                    <h3>Сіздің жаттықтырушыңыз</h3>
                                    <p style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                       <Star size={16} color="#ffc107"/> 
                                       <strong>{coach.firstName} {coach.lastName}</strong>
                                    </p>
                                </div>
                            </div>
                        )}

                        {!hasCoach && (
                             <div className="item-card">
                                <div className="item-card__info">
                                    <h3>Жаттықтырушы тағайындалмаған</h3>
                                    <p>Таңдауды бастау үшін төмендегі батырманы басыңыз.</p>
                                </div>
                                <Link to="/athlete/find-coach" className="btn btn-primary">
                                    <Search size={16} style={{marginRight: '8px'}}/>
                                    Жаттықтырушы табу
                                </Link>
                            </div>
                        )}

                         <div className="item-card">
                            <div className="item-card__info">
                                <h3>Менің турнирлерім</h3>
                                <p>Алдағы және өткен жарыстарды қарап шығыңыз.</p>
                            </div>
                            <Link to="/athlete/my-tournaments" className="btn btn-primary">
                                 <Shield size={16} style={{marginRight: '8px'}}/>
                                 Турнирлерді көру
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AthleteDashboard;
