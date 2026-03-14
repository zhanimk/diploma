import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../../store/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, Calendar, MapPin, Weight, Shield, Edit, X, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AthleteProfile.css';

const InfoItem = ({ icon, label, value }) => (
    <div className="info-item">
        <div className="info-item-icon">{icon}</div>
        <div className="info-item-content">
            <span className="info-item-label">{label}</span>
            <span className="info-item-value">{value || 'Көрсетілмеген'}</span>
        </div>
    </div>
);

const AthleteProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user: userInfo } = useSelector((state) => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (userInfo) {
            const dob = userInfo.dateOfBirth;
            const formattedDate = dob && !isNaN(new Date(dob)) ? new Date(dob).toISOString().split('T')[0] : '';

            setFormData({
                firstName: userInfo.firstName || '',
                lastName: userInfo.lastName || '',
                email: userInfo.email || '',
                city: userInfo.city || '',
                gender: userInfo.gender || 'male',
                dateOfBirth: formattedDate,
                // Ensure weight is handled correctly (null/undefined vs 0)
                weight: (userInfo.weight !== null && userInfo.weight !== undefined) ? userInfo.weight : '',
                rank: userInfo.rank || '',
            });
        }
    }, [userInfo]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Профиль жаңартылуда...');

        if (!userInfo || !userInfo.token) {
            toast.error('Сессияның мерзімі бітті. Қайта кіріңіз.', { id: toastId });
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            
            // Create a payload, ensuring weight is a number or null
            const payload = {
                ...formData,
                weight: (formData.weight === '' || formData.weight === null) ? null : parseFloat(formData.weight)
            };

            const { data: updatedFields } = await axios.put('/api/users/profile', payload, config);
            
            dispatch(updateUser(updatedFields));

            toast.success('Профиль сәтті жаңартылды!', { id: toastId });
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Қате орын алды', { id: toastId });
        }
    };

    if (!userInfo) {
        return <div className="profile-page-container"><p>Жүктелуде...</p></div>;
    }

    return (
        <div className="profile-page-container">
            <button onClick={() => navigate(-1)} className="btn-back"><ArrowLeft size={20} /><span>Артқа</span></button>
            
            <div className="profile-section-card">
                {isEditing ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-section-header"><h3>Жеке ақпаратты өңдеу</h3></div>
                         <div className="form-grid">
                            <div className="input-group"><label><User size={14}/> Аты</label><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} /></div>
                            <div className="input-group"><label><User size={14}/> Тегі</label><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} /></div>
                            <div className="input-group input-group-full"><label><Mail size={14}/> Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} /></div>
                            <div className="input-group"><label><MapPin size={14}/> Қала</label><input type="text" name="city" value={formData.city} onChange={handleChange} /></div>
                            <div className="input-group"><label><Calendar size={14}/> Туған күні</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} /></div>
                            <div className="input-group"><label><Shield size={14}/> Дәреже</label><input type="text" name="rank" value={formData.rank} onChange={handleChange} /></div>
                            <div className="input-group"><label><Weight size={14}/> Салмақ (кг)</label><input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} /></div>
                            <div className="input-group input-group-full gender-selection-profile">
                                <label>Жынысы</label>
                                 <div className="gender-options-profile">
                                    <label className={formData.gender === 'male' ? 'active' : ''}><input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} />Ер</label>
                                    <label className={formData.gender === 'female' ? 'active' : ''}><input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange}/>Әйел</label>
                                </div>
                            </div>
                        </div>
                        <div className="form-actions">
                             <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary"><X size={18} /> Болдырмау</button>
                             <button type="submit" className="btn btn-primary"><Save size={18} /> Сақтау</button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-view">
                        <div className="profile-header">
                            <div>
                                <h2>Жеке профиль</h2>
                                <p>Жеке ақпаратыңызды қараңыз және өңдеңіз</p>
                            </div>
                            <button onClick={() => setIsEditing(true)} className="btn btn-primary-icon"><Edit size={18} /></button>
                        </div>
                        <div className="profile-view-grid">
                            <InfoItem icon={<User size={20} />} label="Аты, Тегі" value={`${formData.firstName} ${formData.lastName}`} />
                            <InfoItem icon={<Mail size={20} />} label="Email" value={formData.email} />
                            <InfoItem icon={<MapPin size={20} />} label="Қала" value={formData.city} />
                            <InfoItem icon={<User size={20} />} label="Жынысы" value={formData.gender === 'male' ? 'Ер' : 'Әйел'} />
                            <InfoItem 
                                icon={<Calendar size={20} />} 
                                label="Туған күні" 
                                value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Көрсетілмеген'} 
                            />
                            <InfoItem icon={<Shield size={20} />} label="Клуб" value={userInfo.club?.name || 'Клуб жоқ'} />
                            <InfoItem icon={<Shield size={20} />} label="Дәреже" value={formData.rank} />
                            {/* THE FIX: This line is now robust and handles 0, null, and undefined correctly */}
                            <InfoItem 
                                icon={<Weight size={20} />}
                                label="Салмақ"
                                value={(formData.weight || formData.weight === 0) ? `${formData.weight} кг` : null}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AthleteProfile;
