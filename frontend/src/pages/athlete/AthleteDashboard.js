import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/authSlice';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../Home/HomePage.css'; 
import './Dashboard.css';
import { User, Mail, Phone, Calendar, MapPin, Award, Home } from 'lucide-react';

const AthleteDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [coach, setCoach] = useState(null);
    const [loadingCoach, setLoadingCoach] = useState(true);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        if (user) {
            // Устанавливаем данные формы для редактирования
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phoneNumber: user.phoneNumber || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                club: user.club || '',
                city: user.city || ''
            });

            // Загрузка информации о тренере
            const fetchCoach = async () => {
                setLoadingCoach(true);
                try {
                    if (user.coach) {
                         const { data } = await axios.get(`/api/users/${user.coach}`);
                         setCoach(data);
                    } else {
                        setCoach(null);
                    }
                } catch (error) {
                    console.error('Failed to fetch coach', error);
                } finally {
                    setLoadingCoach(false);
                }
            };

            // Загрузка истории для статистики
            const fetchHistory = async () => {
                setLoadingHistory(true);
                try {
                    const { data } = await axios.get(`/api/users/${user._id}/history`);
                    setHistory(data);
                } catch (error) {
                    console.error('Failed to fetch history', error);
                } finally {
                    setLoadingHistory(false);
                }
            };

            if (user.role === 'athlete') {
                fetchCoach();
                fetchHistory();
            } else {
                setLoadingCoach(false);
                setLoadingHistory(false);
            }
        }
    }, [user]);

    // --- Функции для обработки данных ---
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const updatePromise = axios.put('/api/users/profile', formData).then(res => {
            dispatch(setUser(res.data));
            setIsEditing(false);
            return res.data;
        });
        toast.promise(updatePromise, {
            loading: 'Профиль жаңартылуда...',
            success: <b>Профиль сәтті жаңартылды!</b>,
            error: <b>Профильді жаңарту кезінде қате.</b>,
        });
    };
    
    const handleUnlinkCoach = async () => {
        const promise = axios.put('/api/users/profile/unlink-coach').then(res => {
            dispatch(setUser(res.data));
            setCoach(null);
            return res.data;
        });
        toast.promise(promise, {
            loading: 'Байланыс үзілуде...',
            success: <b>Жаттықтырушымен байланыс сәтті үзілді.</b>,
            error: <b>Байланысты үзу кезінде қате.</b>,
        });
    };

    // --- Расчет статистики ---
    const totalFights = history.reduce((acc, curr) => acc + (curr.fights || 0), 0);
    const totalWins = history.reduce((acc, curr) => acc + (curr.wins || 0), 0);
    const winRate = totalFights > 0 ? ((totalWins / totalFights) * 100).toFixed(0) : 0;

    if (!user) return <div className="container">Жүктелуде...</div>;

    const ProfileField = ({ icon, label, value, defaultValue = 'Көрсетілмеген' }) => (
        <div className="profile-field">
            <div className="profile-field__icon">{icon}</div>
            <div className="profile-field__body">
                <span className="profile-field__label">{label}</span>
                <span className="profile-field__value">{value || defaultValue}</span>
            </div>
        </div>
    );

    return (
        <div className="container dashboard-grid">
            <nav className="dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/athlete/dashboard" className="active">Профиль</Link></li>
                    <li><Link to="/athlete/find-coach">Жаттықтырушыны табу</Link></li>
                    <li><Link to="/athlete/tournaments">Менің турнирлерім</Link></li>
                    <li><Link to="/athlete/history">Жарыс тарихы</Link></li>
                </ul>
            </nav>

            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h2>Спортшының басқару панелі</h2>
                    <p>Жеке ақпаратты басқару, жаттықтырушымен байланыс және турнирлерге қатысу.</p>
                </header>
                
                <div className="dashboard-main-grid">
                    <div className="profile-section card">
                        <div className="card-header">
                            <h3>Жеке ақпарат</h3>
                            <button onClick={() => setIsEditing(!isEditing)} className="card-header-action">
                                {isEditing ? 'Болдырмау' : 'Өңдеу'}
                            </button>
                        </div>

                        {!isEditing ? (
                            <div className="profile-fields-grid">
                                <ProfileField icon={<User />} label="Аты" value={user.firstName} />
                                <ProfileField icon={<User />} label="Тегі" value={user.lastName} />
                                <ProfileField icon={<Mail />} label="Email" value={user.email} />
                                <ProfileField icon={<Phone />} label="Телефон" value={user.phoneNumber} />
                                <ProfileField icon={<Calendar />} label="Туған күні" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : null} />
                                <ProfileField icon={<MapPin />} label="Қала" value={user.city} />
                                <ProfileField icon={<Home />} label="Клуб" value={user.club} />
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                                <div className="form-grid">
                                    <div className="form-group"><label>Аты:</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} /></div>
                                    <div className="form-group"><label>Тегі:</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} /></div>
                                    <div className="form-group"><label>Телефон:</label><input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} /></div>
                                    <div className="form-group"><label>Туған күні:</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} /></div>
                                    <div className="form-group"><label>Қала:</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} /></div>
                                    <div className="form-group"><label>Клуб:</label><input type="text" name="club" value={formData.club} onChange={handleInputChange} /></div>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="f-btn-main">Сақтау</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="f-btn-link">Болдырмау</button>
                                </div>
                            </form>
                        )}
                    </div>

                    <aside className="dashboard-side-grid">
                        <div className="coach-section card">
                            <div className="card-header"><h3>Сіздің жаттықтырушыңыз</h3></div>
                            {loadingCoach ? <p className="loading-text">Жүктелуде...</p> :
                                coach ? (
                                    <div className="coach-info">
                                        <div className="profile-field">
                                            <div className="profile-field__icon"><Award /></div>
                                            <div className="profile-field__body">
                                                <span className="profile-field__label">{coach.firstName} {coach.lastName}</span>
                                                <span className="profile-field__value">{coach.email}</span>
                                            </div>
                                        </div>
                                        <button onClick={handleUnlinkCoach} className="f-btn-link danger-link">Байланысты үзу</button>
                                    </div>
                                ) : (
                                    <div className="coach-missing">
                                        <p>Сізде әлі жаттықтырушы жоқ.</p>
                                        <Link to="/athlete/find-coach" className="f-btn-main small">Жаттықтырушыны табу</Link>
                                    </div>
                                )
                            }
                        </div>
                         <div className="stats-summary-card card">
                            <div className="card-header"><h3>Жалпы статистика</h3></div>
                             {loadingHistory ? <p>Жүктелуде...</p> : (
                                 <div className="stats-summary-grid compact">
                                    <div className="stat-card">
                                        <div className="stat-card__value">{totalFights}</div>
                                        <div className="stat-card__label">Жекпе-жек</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-card__value">{totalWins}</div>
                                        <div className="stat-card__label">Жеңіс</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-card__value">{winRate}%</div>
                                        <div className="stat-card__label">Winrate</div>
                                    </div>
                                </div>
                             )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default AthleteDashboard;
