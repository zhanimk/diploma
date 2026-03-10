import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Calendar, MapPin, Weight, Shield, Edit, X, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user: userInfo } = useSelector((state) => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (userInfo) {
            setFormData({
                firstName: userInfo.firstName || '',
                lastName: userInfo.lastName || '',
                email: userInfo.email || '',
                phoneNumber: userInfo.phoneNumber || '',
                dateOfBirth: userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth).toISOString().split('T')[0] : '',
                gender: userInfo.gender || 'male',
                city: userInfo.city || '',
                // Specific fields
                club: userInfo.club?.name || '', 
                weight: userInfo.weight !== undefined ? userInfo.weight : '',
                rank: userInfo.rank || ''
            });
        }
    }, [userInfo]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Профиль жаңартылуда...');

        try {
            // Use the single, powerful endpoint
            const { data } = await axios.put('/api/users/profile', formData);
            dispatch(setUser(data)); // Update Redux state with the full returned user object
            toast.success('Профиль сәтті жаңартылды!', { id: toastId });
            setIsEditing(false);
        } catch (error) {
            const message = error.response?.data?.message || 'Қате орын алды';
            toast.error(message, { id: toastId });
        }
    };
    
    const InfoItem = ({ icon, label, value }) => (
        <div className="info-item">
            <div className="info-item-icon">{icon}</div>
            <div className="info-item-content">
                <span className="info-item-label">{label}</span>
                <span className="info-item-value">{value || 'Көрсетілмеген'}</span>
            </div>
        </div>
    );

    if (!userInfo) {
        return <div className="profile-page-container"><div className="profile-card">Жүктелуде...</div></div>;
    }

    return (
        <div className="profile-page-container">
            <div className="profile-card">
                 <button onClick={() => navigate(-1)} className="btn-back">
                    <ArrowLeft size={20} />
                    <span>Артқа</span>
                </button>

                <div className="profile-header">
                    <div>
                        <h2>Жеке профиль</h2>
                        <p>Жеке ақпаратыңызды қараңыз немесе өзгертіңіз</p>
                    </div>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="profile-form">
                         <div className="form-grid">
                            <div className="input-group"><label><User size={14}/> Аты</label><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} /></div>
                            <div className="input-group"><label><User size={14}/> Тегі</label><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} /></div>
                            <div className="input-group input-group-full"><label><Mail size={14}/> Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} /></div>
                            <div className="input-group"><label><Phone size={14}/> Телефон нөмірі</label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} /></div>
                            <div className="input-group"><label><Calendar size={14}/> Туған күні</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} /></div>
                            <div className="input-group input-group-full gender-selection-profile">
                                <label>Жынысы</label>
                                <div className="gender-options-profile">
                                    <label className={formData.gender === 'male' ? 'active' : ''} onClick={() => setFormData({...formData, gender: 'male'})}>Ер<input type="radio" name="gender" readOnly checked={formData.gender === 'male'} /></label>
                                    <label className={formData.gender === 'female' ? 'active' : ''} onClick={() => setFormData({...formData, gender: 'female'})}>Әйел<input type="radio" name="gender" readOnly checked={formData.gender === 'female'} /></label>
                                </div>
                            </div>
                            <div className="input-group"><label><MapPin size={14}/> Қала</label><input type="text" name="city" value={formData.city} onChange={handleChange} /></div>
                            {userInfo.role === 'athlete' && <div className="input-group"><label><Shield size={14}/> Дәреже</label><input type="text" name="rank" value={formData.rank} onChange={handleChange} /></div>}
                            {userInfo.role === 'athlete' && <div className="input-group"><label><Weight size={14}/> Салмақ (кг)</label><input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} /></div>}
                        </div>
                        <div className="form-actions">
                             <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary"><X size={18} /> Болдырмау</button>
                             <button type="submit" className="btn btn-primary"><Save size={18} /> Сақтау</button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-view">
                        <div className="profile-view-grid">
                            <InfoItem icon={<User size={20} />} label="Аты, Тегі" value={`${formData.firstName} ${formData.lastName}`} />
                            <InfoItem icon={<Mail size={20} />} label="Email" value={formData.email} />
                            <InfoItem icon={<Phone size={20} />} label="Телефон" value={formData.phoneNumber} />
                            <InfoItem icon={<Calendar size={20} />} label="Туған күні" value={new Date(formData.dateOfBirth).toLocaleDateString()} />
                            <InfoItem icon={<User size={20} />} label="Жынысы" value={formData.gender === 'male' ? 'Ер' : 'Әйел'} />
                            <InfoItem icon={<MapPin size={20} />} label="Қала" value={formData.city} />
                            {userInfo.role === 'coach' && userInfo.club && <InfoItem icon={<Shield size={20} />} label="Клуб" value={userInfo.club.name} />}
                            {userInfo.role === 'athlete' && <InfoItem icon={<Shield size={20} />} label="Клуб" value={formData.club} />}
                            {userInfo.role === 'athlete' && <InfoItem icon={<Shield size={20} />} label="Дәреже" value={formData.rank} />}
                            {userInfo.role === 'athlete' && <InfoItem icon={<Weight size={20} />} label="Салмақ" value={formData.weight ? `${formData.weight} кг` : ''} />}
                        </div>
                         <div className="form-actions">
                            <button onClick={() => setIsEditing(true)} className="btn btn-primary"><Edit size={18} /> Профильді өңдеу</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
