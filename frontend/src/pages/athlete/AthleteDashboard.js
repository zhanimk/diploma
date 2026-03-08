import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/authSlice';
import { Link } from 'react-router-dom';
import '../Home/HomePage.css'; 
import './Dashboard.css';

const AthleteDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [isEditing, setIsEditing] = useState(false);
    // Инициализируем formData с пустыми строками, чтобы избежать ошибки uncontrolled/controlled
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        dateOfBirth: '',
        club: '',
        city: ''
    });
    const [coach, setCoach] = useState(null);
    const [coachRequests, setCoachRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Загружаем данные о тренере или запросах
                if (user && user.coach) {
                    const coachRes = await axios.get('/api/users/athlete/coach');
                    setCoach(coachRes.data);
                } else if (user) {
                    const coachRequestsRes = await axios.get('/api/users/athlete/coach-requests');
                    setCoachRequests(coachRequestsRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };

        // Когда данные пользователя (user) загружены, обновляем состояние формы
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phoneNumber: user.phoneNumber || '',
                // Форматируем дату для поля input type="date"
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                club: user.club || '',
                city: user.city || ''
            });
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user]); // Этот эффект зависит от объекта user

    const handleRespond = async (coachId, accept) => {
        try {
            const { data } = await axios.put('/api/users/athlete/respond-coach', { coachId, accept });
            // Обновляем данные пользователя в Redux, чтобы сразу отобразить изменения
            dispatch(setUser(data));
        } catch (error) {
            console.error('Failed to respond to coach request', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put('/api/users/profile', formData);
            dispatch(setUser(data)); // Обновляем Redux store новыми данными
            setIsEditing(false); // Выходим из режима редактирования
        } catch (error) {
            console.error('Failed to update profile', error);
        }
    };

    if (!user) {
        return <div className="container">Загрузка данных... Пожалуйста, войдите в систему.</div>;
    }

    return (
        <div className="container dashboard-grid">
            <nav className="dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/athlete/dashboard" className="active">Профиль</Link></li>
                    <li><Link to="/athlete/tournaments">Мои турниры</Link></li>
                    <li><Link to="/athlete/history">История выступлений</Link></li>
                </ul>
            </nav>

            <div className="dashboard-content">
                <h2>Панель управления спортсмена</h2>
                
                <div className="profile-section card">
                    <h3>Профиль</h3>
                    {!isEditing ? (
                        <>
                            {/* Отображаем данные из Redux store (user) */}
                            <p><strong>Имя:</strong> {user.firstName}</p>
                            <p><strong>Фамилия:</strong> {user.lastName}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Телефон:</strong> {user.phoneNumber || 'Не указан'}</p>
                            <p><strong>Дата рождения:</strong> {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Не указана'}</p>
                            <p><strong>Клуб:</strong> {user.club || 'Не указан'}</p>
                            <p><strong>Город:</strong> {user.city || 'Не указан'}</p>
                            <button onClick={() => setIsEditing(true)} className="f-btn-main">Редактировать</button>
                        </>
                    ) : (
                        <form onSubmit={handleUpdateProfile}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Имя:</label>
                                    {/* Значения для полей берем из formData */}
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Фамилия:</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Телефон:</label>
                                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Дата рождения:</label>
                                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Клуб:</label>
                                    <input type="text" name="club" value={formData.club} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Город:</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} />
                                </div>
                            </div>
                            <button type="submit" className="f-btn-main">Сохранить</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="f-btn-link">Отмена</button>
                        </form>
                    )}
                </div>

                 <div className="coach-section card">
                    <h3>Тренер</h3>
                    {loading ? <p>Загрузка...</p> :
                        coach ? (
                            <div>
                                <p><strong>Имя:</strong> {coach.firstName} {coach.lastName}</p>
                                <p><strong>Email:</strong> {coach.email}</p>
                            </div>
                        ) : coachRequests.length > 0 ? (
                            <div>
                                <h4>Запросы от тренеров:</h4>
                                {coachRequests.map(req => (
                                    <div key={req._id} className="coach-request">
                                        <p><strong>{req.coach.firstName} {req.coach.lastName}</strong> хочет стать вашим тренером.</p>
                                        <div>
                                            <button onClick={() => handleRespond(req.coach._id, true)} className="f-btn-main small">Принять</button>
                                            <button onClick={() => handleRespond(req.coach._id, false)} className="f-btn-link small">Отклонить</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>У вас пока нет тренера. Вы можете найти тренера в общем списке и отправить ему запрос, или дождаться запроса от него.</p>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default AthleteDashboard;
