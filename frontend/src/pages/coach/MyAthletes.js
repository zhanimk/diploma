
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { User, Mail, Trash2, Eye, Edit, Save, X, Shield, MapPin, Weight, Calendar, UserPlus } from 'lucide-react';
import './CoachDashboard.css'; 
import './MyAthletes.css';   

const AthleteCard = ({ athlete, onRemove, onUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData({
            firstName: athlete.firstName || '',
            lastName: athlete.lastName || '',
            email: athlete.email || '',
            dateOfBirth: athlete.dateOfBirth ? new Date(athlete.dateOfBirth).toISOString().split('T')[0] : '',
            club: athlete.club || '',
            city: athlete.city || '',
            weight: athlete.weight !== undefined ? athlete.weight : '',
        });
    }, [athlete]);

    const handleToggleExpand = () => setIsExpanded(!isExpanded);
    const handleEdit = () => { setIsEditing(true); setIsExpanded(true); };
    const handleCancel = () => {
        setIsEditing(false);
        setFormData({ ...athlete, dateOfBirth: athlete.dateOfBirth ? new Date(athlete.dateOfBirth).toISOString().split('T')[0] : '' });
    };
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(athlete._id, formData);
        setIsEditing(false);
    };

    const InfoField = ({ icon, label, value }) => (
        <div className="profile-field compact">
            <div className="profile-field__icon">{icon}</div>
            <div className="profile-field__content">
                <div className="profile-field__label">{label}</div>
                <div className="profile-field__value">{value || 'Көрсетілмеген'}</div>
            </div>
        </div>
    );

    return (
        <div className="athlete-card-details">
            <div className="card-header">
                <h3>{athlete.firstName} {athlete.lastName}</h3>
                <div className="card-header-actions">
                    <button onClick={handleToggleExpand} className="action-btn" title={isExpanded ? "Жасыру" : "Толығырақ"}>
                        <Eye size={18} />
                    </button>
                    <button onClick={handleEdit} className="action-btn" title="Өңдеу">
                        <Edit size={18} />
                    </button>
                    <button onClick={() => onRemove(athlete._id)} className="action-btn danger-btn" title="Жою">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                !isEditing ? (
                    <div className="profile-fields-grid compact">
                        <InfoField icon={<Mail size={16} />} label="Email" value={athlete.email} />
                        <InfoField icon={<Calendar size={16} />} label="Туған күні" value={formData.dateOfBirth} />
                        <InfoField icon={<Shield size={16} />} label="Клуб" value={athlete.club} />
                        <InfoField icon={<MapPin size={16} />} label="Қала" value={athlete.city} />
                        <InfoField icon={<Weight size={16} />} label="Салмақ" value={athlete.weight ? `${athlete.weight} кг` : 'Көрсетілмеген'} />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="profile-edit-form compact">
                        <div className="form-grid compact">
                            <div><label>Аты</label><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} /></div>
                            <div><label>Тегі</label><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} /></div>
                            <div><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} disabled /></div>
                            <div><label>Туған күні</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} /></div>
                            <div><label>Клуб</label><input type="text" name="club" value={formData.club} onChange={handleChange} /></div>
                            <div><label>Қала</label><input type="text" name="city" value={formData.city} onChange={handleChange} /></div>
                            <div><label>Салмақ (кг)</label><input type="number" name="weight" value={formData.weight} onChange={handleChange} step="0.1" /></div>
                        </div>
                        <div className="card-header-actions" style={{ justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: `1px solid ${'var(--border-color-dark'}`}}>
                            <button type="button" onClick={handleCancel} className="action-btn"><X size={18} style={{ marginRight: '0.5rem' }} /> Болдырмау</button>
                            <button type="submit" className="action-btn success-btn"><Save size={18} style={{ marginRight: '0.5rem' }} /> Сақтау</button>
                        </div>
                    </form>
                )
            )}
        </div>
    );
};

const MyAthletes = () => {
    const [athletes, setAthletes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAthletes = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/users/coach/my-athletes');
            setAthletes(data);
        } catch (err) {
            setError("Спортшылар туралы деректерді алу кезінде қате.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAthletes();
    }, [fetchAthletes]);

    const handleRemoveStudent = (studentId) => {
        const promise = axios.put('/api/users/coach/remove-student', { studentId })
            .then(() => fetchAthletes());

        toast.promise(promise, {
            loading: 'Спортшы жойылуда...',
            success: <b>Спортшы сәтті жойылды</b>,
            error: (err) => err.response?.data?.message || <b>Операцияны орындау кезінде қате.</b>
        });
    };

    const handleUpdateAthlete = (athleteId, updatedData) => {
        const promise = axios.put(`/api/users/coach/update-athlete/${athleteId}`, updatedData)
            .then(() => fetchAthletes());

        toast.promise(promise, {
            loading: 'Мәліметтер жаңартылуда...',
            success: <b>Спортшы сәтті жаңартылды</b>,
            error: (err) => err.response?.data?.message || <b>Жаңарту кезінде қате.</b>
        });
    };

    return (
        <div className="container coach-dashboard-grid">
           <nav className="coach-dashboard-nav">
                <h3>Навигация</h3>
                <ul>
                    <li><Link to="/coach/dashboard">Басты бет</Link></li>
                    <li><Link to="/coach/my-athletes" className="active">Менің спортшыларым</Link></li>
                    <li><Link to="/coach/applications">Турнирлік өтінімдер</Link></li>
                    <li><Link to="/coach/requests">Қосылу сұраныстары</Link></li>
                </ul>
            </nav>
            <main className="coach-dashboard-content">
                <header className="page-header my-athletes-header">
                    <div>
                        <h1>Менің спортшыларым</h1>
                        <p>Бұл жерде сіз өз командаңыздағы спортшылардың профильдерін басқара аласыз.</p>
                    </div>
                    <Link to="/coach/register-athlete" className="btn-add-athlete">
                        <UserPlus size={18} />
                        <span>Спортшыны тіркеу</span>
                    </Link>
                </header>

                {loading && <div className="loading-message">Жүктелуде...</div>}
                {error && <div className="error-message">{error}</div>}

                {!loading && !error && (
                    <div className="athletes-container">
                        {athletes.length > 0 ? athletes.map(athlete => (
                            <AthleteCard 
                                key={athlete._id} 
                                athlete={athlete} 
                                onRemove={handleRemoveStudent} 
                                onUpdate={handleUpdateAthlete} 
                            />
                        )) : (
                            <div className="empty-state">
                                <h3>Сіздің командаңызда спортшылар әлі жоқ</h3>
                                <p>Жаңа спортшыны қосу үшін жоғарыдағы "Спортшыны тіркеу" батырмасын басыңыз.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyAthletes;
