import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setClub } from '../../store/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, MapPin, Edit, X, Save, ArrowLeft, Home, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CoachProfile.css';

// Компонент для отображения информации (без изменений)
const InfoItem = ({ icon, label, value, isLogo = false }) => (
    <div className="info-item">
        <div className="info-item-icon">{icon}</div>
        <div className="info-item-content">
            <span className="info-item-label">{label}</span>
            {isLogo ? (
                value ? <img src={value} alt="Club Logo" className="info-item-logo" /> : <span className="info-item-value">Жоқ</span>
            ) : (
                <span className="info-item-value">{value || 'Көрсетілмеген'}</span>
            )}
        </div>
    </div>
);

// Упрощенный компонент управления клубом
const ClubManagement = () => {
    const dispatch = useDispatch();
    const { user: userInfo } = useSelector((state) => state.auth);
    const existingClub = userInfo?.club; // Получаем клуб из профиля пользователя

    // Состояние формы инициализируется данными существующего клуба или пустыми строками
    const [formData, setFormData] = useState({
        name: existingClub?.name || '',
        city: existingClub?.city || '',
        logo: existingClub?.logo || '',
    });
    
    const [isEditing, setIsEditing] = useState(!existingClub);
    const [uploading, setUploading] = useState(false);

    // Эффект для синхронизации формы, если данные клуба из Redux изменятся
    useEffect(() => {
        if (existingClub) {
            setFormData({
                name: existingClub.name || '',
                city: existingClub.city || '',
                logo: existingClub.logo || '',
            });
            setIsEditing(false); // Если клуб есть, по умолчанию режим просмотра
        } else {
            setIsEditing(true); // Если клуба нет, всегда режим редактирования
        }
    }, [existingClub]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCancel = () => {
        if (existingClub) {
            setFormData({ // Сброс к сохраненным данным
                name: existingClub.name || '',
                city: existingClub.city || '',
                logo: existingClub.logo || '',
            });
            setIsEditing(false);
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const bodyFormData = new FormData();
        bodyFormData.append('image', file);
        setUploading(true);
        const toastId = toast.loading('Логотип жүктелуде...');
        try {
            const { data } = await axios.post('/api/upload', bodyFormData);
            setFormData({ ...formData, logo: data.image }); // Обновляем только лого в форме
            toast.success('Логотип сәтті жүктелді!', { id: toastId });
        } catch (error) {
            toast.error('Логотипті жүктеу кезінде қате орын алды.', { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requestData = { name: formData.name, city: formData.city, logo: formData.logo };
        
        const promise = existingClub
            // Если клуб существует - отправляем PUT запрос на ИЗМЕНЕНИЕ
            ? axios.put('/api/clubs/my-club', requestData)
            // Если клуба не существует - отправляем POST запрос на СОЗДАНИЕ
            : axios.post('/api/clubs', requestData);

        toast.promise(
            promise,
            {
                loading: 'Ақпарат сақталуда...',
                success: (response) => {
                    dispatch(setClub(response.data));
                    setIsEditing(false);
                    return 'Клуб сәтті сақталды!';
                },
                error: (err) => err.response?.data?.message || 'Қате орын алды',
            }
        );
    };

    if (isEditing) {
        return (
            <div className="profile-section-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-section-header">
                        <h3>{existingClub ? 'Клуб ақпаратын өзгерту' : 'Клуб ақпаратын толтырыңыз'}</h3>
                        <p>Өзіңіздің ресми клуб ақпаратыңызды толтырыңыз</p>
                    </div>
                    <div className="form-grid">
                        <div className="input-group"><label><Home size={14}/> Клуб атауы</label><input type="text" name="name" value={formData.name} onChange={handleChange} /></div>
                        <div className="input-group"><label><MapPin size={14}/> Клуб қаласы</label><input type="text" name="city" value={formData.city} onChange={handleChange} /></div>
                        <div className="input-group input-group-full">
                            <label><UploadCloud size={14}/> Клуб логотипі</label>
                            <input type="text" name="logo" value={formData.logo} placeholder="Логотип URL" readOnly />
                            <input type="file" id="logoUpload" className="file-input" onChange={uploadFileHandler} disabled={uploading}/>
                            <label htmlFor="logoUpload" className={`btn btn-secondary file-btn ${uploading ? 'disabled' : ''}`}>{uploading ? 'Жүктелуде...' : 'Файл таңдау'}</label>
                        </div>
                        {formData.logo && <div className="logo-preview"><img src={formData.logo} alt="Logo Preview"/></div>}
                    </div>
                    <div className="form-actions">
                         {existingClub && <button type="button" onClick={handleCancel} className="btn btn-secondary"><X size={18} /> Болдырмау</button>}
                         <button type="submit" className="btn btn-primary" disabled={uploading}><Save size={18} /> Сақтау</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="profile-section-card">
            <div className="profile-view">
                <div className="profile-header">
                    <div><h2>Менің клубым</h2><p>Клуб ақпаратын қараңыз және басқарыңыз</p></div>
                    <button onClick={() => setIsEditing(true)} className="btn btn-primary-icon"><Edit size={18} /></button>
                </div>
                <div className="profile-view-grid">
                    <InfoItem icon={<Home size={20} />} label="Клуб" value={existingClub?.name} />
                    <InfoItem icon={<MapPin size={20} />} label="Клуб қаласы" value={existingClub?.city} />
                    <InfoItem icon={<Home size={20} />} label="Клуб логотипі" value={existingClub?.logo} isLogo={true} />
                </div>
            </div>
        </div>
    );
}

// Основной компонент страницы (логика профиля пользователя без изменений)
const CoachProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: userInfo } = useSelector((state) => state.auth);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({});

    useEffect(() => {
        if (userInfo) {
            setProfileData({ 
                firstName: userInfo.firstName || '', lastName: userInfo.lastName || '', 
                email: userInfo.email || '', city: userInfo.city || '', 
                gender: userInfo.gender || 'male' 
            });
        }
    }, [userInfo]);

    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        toast.promise(
            axios.put('/api/users/profile', profileData),
            {
                loading: 'Профиль жаңартылуда...',
                success: (res) => {
                    dispatch(setUser(res.data));
                    setIsEditingProfile(false);
                    return 'Профиль сәтті жаңартылды!';
                },
                error: (err) => err.response?.data?.message || 'Профильді жаңарту кезінде қате орын алды',
            }
        );
    };

    return (
        <div className="profile-page-container">
            <button onClick={() => navigate(-1)} className="btn-back"><ArrowLeft size={20} /><span>Артқа</span></button>
            <div className="profile-layout">
                {/* Компонент профиля пользователя */}
                <div className="profile-section-card">
                    {isEditingProfile ? (
                        <form onSubmit={handleProfileSubmit}>
                             <div className="form-section-header"><h3>Жеке ақпарат</h3></div>
                             <div className="form-grid">
                                <div className="input-group"><label><User size={14}/> Аты</label><input type="text" name="firstName" value={profileData.firstName} onChange={handleProfileChange} /></div>
                                <div className="input-group"><label><User size={14}/> Тегі</label><input type="text" name="lastName" value={profileData.lastName} onChange={handleProfileChange} /></div>
                                <div className="input-group input-group-full"><label><Mail size={14}/> Email</label><input type="email" name="email" value={profileData.email} onChange={handleProfileChange} /></div>
                                <div className="input-group"><label><MapPin size={14}/> Қала</label><input type="text" name="city" value={profileData.city} onChange={handleProfileChange} /></div>
                                <div className="input-group input-group-full gender-selection-profile"><label>Жынысы</label>
                                    <div className="gender-options-profile">
                                        <label className={profileData.gender === 'male' ? 'active' : ''}><input type="radio" name="gender" value="male" checked={profileData.gender === 'male'} onChange={handleProfileChange}/>Ер</label>
                                        <label className={profileData.gender === 'female' ? 'active' : ''}><input type="radio" name="gender" value="female" checked={profileData.gender === 'female'} onChange={handleProfileChange}/>Әйел</label>
                                    </div>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setIsEditingProfile(false)} className="btn btn-secondary"><X size={18} /> Болдырмау</button>
                                <button type="submit" className="btn btn-primary"><Save size={18} /> Сақтау</button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-view">
                            <div className="profile-header">
                                <div><h2>Жеке профиль</h2><p>Жеке ақпаратыңызды қараңыз</p></div>
                                <button onClick={() => setIsEditingProfile(true)} className="btn btn-primary-icon"><Edit size={18} /></button>
                            </div>
                             <div className="profile-view-grid">
                                <InfoItem icon={<User size={20} />} label="Аты, Тегі" value={`${profileData.firstName} ${profileData.lastName}`} />
                                <InfoItem icon={<Mail size={20} />} label="Email" value={profileData.email} />
                                <InfoItem icon={<MapPin size={20} />} label="Қала" value={profileData.city} />
                                <InfoItem icon={<User size={20} />} label="Жынысы" value={profileData.gender === 'male' ? 'Ер' : 'Әйел'} />
                            </div>
                        </div>
                    )}
                </div>
                {/* Новый, исправленный компонент управления клубом */}
                <ClubManagement />
            </div>
        </div>
    );
};

export default CoachProfile;
