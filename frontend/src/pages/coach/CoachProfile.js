
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setClub } from '../../store/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, MapPin, Edit, X, Save, ArrowLeft, UploadCloud, Building, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { kazakhstanRegions } from '../../utils/kazakhstanRegions'; // ИМПОРТИРУЕМ РЕГИОНЫ
import { kazakhstanCities } from '../../utils/kazakhstanCities';
import './CoachProfile.css';

const CoachProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: userInfo } = useSelector((state) => state.auth);

    // ... state declarations ...
    const [profileData, setProfileData] = useState({ firstName: '', lastName: '', email: '', city: '', gender: 'male' });
    // ИСПРАВЛЕНО: city -> region
    const [clubData, setClubData] = useState({ name: '', region: '', logo: '' });

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingClub, setIsEditingClub] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (userInfo) {
            setProfileData({ 
                firstName: userInfo.firstName || '', lastName: userInfo.lastName || '', 
                email: userInfo.email || '', city: userInfo.city || '', gender: userInfo.gender || 'male' 
            });
            if (userInfo.club) {
                // ИСПРАВЛЕНО: city -> region
                setClubData({ name: userInfo.club.name || '', region: userInfo.club.region || '', logo: userInfo.club.logo || '' });
                setIsEditingClub(false);
            } else {
                setIsEditingClub(true);
            }
        }
    }, [userInfo]);

    // ... edit state management ...
    const startEditingProfile = () => {
        setProfileData({ 
            firstName: userInfo.firstName || '', lastName: userInfo.lastName || '', 
            email: userInfo.email || '', city: userInfo.city || '', gender: userInfo.gender || 'male' 
        });
        setIsEditingProfile(true);
    };

    const startEditingClub = () => {
        if (userInfo.club) {
            // ИСПРАВЛЕНО: city -> region
            setClubData({ 
                name: userInfo.club.name || '', 
                region: userInfo.club.region || '', 
                logo: userInfo.club.logo || '' 
            });
        }
        setIsEditingClub(true);
    };


    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    // ИСПРАВЛЕНО: name 'city' становится 'region'
    const handleClubChange = (e) => setClubData({ ...clubData, [e.target.name]: e.target.value });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        toast.promise(axios.put('/api/users/profile', profileData), {
            loading: 'Профиль жаңартылуда...',
            success: (res) => {
                dispatch(setUser(res.data));
                setIsEditingProfile(false);
                return 'Профиль сәтті жаңартылды!';
            },
            error: (err) => err.response?.data?.message || 'Қате орын алды',
        });
    };

    const handleClubSubmit = (e) => {
        e.preventDefault();
        // ОТПРАВЛЯЕМ 'region' ВМЕСТО 'city'
        const request = userInfo?.club ? axios.put('/api/clubs/my-club', clubData) : axios.post('/api/clubs', clubData);
        toast.promise(request, {
            loading: 'Клуб ақпараты сақталуда...',
            success: (response) => {
                dispatch(setClub(response.data));
                setIsEditingClub(false);
                return 'Клуб сәтті сақталды!';
            },
            error: (err) => err.response?.data?.message || 'Қате орын алды',
        });
    };

    // ... uploadFileHandler remains the same ...
    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const bodyFormData = new FormData();
        bodyFormData.append('image', file);
        setUploading(true);
        const toastId = toast.loading('Логотип жүктелуде...');
        try {
            const { data } = await axios.post('/api/upload', bodyFormData);
            setClubData({ ...clubData, logo: data.image });
            toast.success('Логотип сәтті жүктелді!', { id: toastId });
        } catch (error) {
            toast.error('Логотипті жүктеу кезінде қате орын алды.', { id: toastId });
        } finally {
            setUploading(false);
        }
    };


    return (
        <div className="coach-profile-container">
            {/* ... header ... */}
            <header className="profile-page-header">
                <button onClick={() => navigate(-1)} className="back-button"><ArrowLeft size={20} /></button>
                <div>
                    <h1>Профильді басқару</h1>
                    <p>Жеке ақпаратты және клуб деректерін жаңартыңыз.</p>
                </div>
            </header>


            <div className="profile-grid">
                {/* --- Profile Card (city is correct here for user profile) --- */}
                <div className="profile-card">
                     <div className="card-header">
                        <h2>Жеке ақпарат</h2>
                        <button onClick={isEditingProfile ? () => setIsEditingProfile(false) : startEditingProfile} className="edit-button">
                            {isEditingProfile ? <X size={18} /> : <Edit size={18} />}
                        </button>
                    </div>
                    {isEditingProfile ? (
                        <form onSubmit={handleProfileSubmit} className="card-body">
                            <div className="input-wrapper"><User size={16} className="input-icon" /><input type="text" name="firstName" placeholder="Аты" value={profileData.firstName} onChange={handleProfileChange} /></div>
                            <div className="input-wrapper"><User size={16} className="input-icon" /><input type="text" name="lastName" placeholder="Тегі" value={profileData.lastName} onChange={handleProfileChange} /></div>
                            <div className="input-wrapper"><Mail size={16} className="input-icon" /><input type="email" name="email" placeholder="Email" value={profileData.email} onChange={handleProfileChange} /></div>
                            <div className="input-wrapper">
                                <MapPin size={16} className="input-icon" />
                                <select name="city" value={profileData.city} onChange={handleProfileChange}>
                                    <option value="">Қаланы таңдаңыз</option>
                                    {kazakhstanCities.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>
                            <div className="gender-selector">
                                <label className={profileData.gender === 'male' ? 'active' : ''}><input type="radio" name="gender" value="male" checked={profileData.gender === 'male'} onChange={handleProfileChange}/>Ер</label>
                                <label className={profileData.gender === 'female' ? 'active' : ''}><input type="radio" name="gender" value="female" checked={profileData.gender === 'female'} onChange={handleProfileChange}/>Әйел</label>
                            </div>
                            <button type="submit" className="save-button"><Save size={18}/> Сақтау</button>
                        </form>
                    ) : (
                        <div className="card-body view-mode">
                            <InfoRow icon={<User size={18}/>} label="Аты-жөні" value={`${userInfo.firstName || ''} ${userInfo.lastName || ''}`} />
                            <InfoRow icon={<Mail size={18}/>} label="Email" value={userInfo.email} />
                            <InfoRow icon={<MapPin size={18}/>} label="Қала" value={userInfo.city || 'Көрсетілмеген'} />
                            <InfoRow icon={<User size={18}/>} label="Жынысы" value={userInfo.gender === 'male' ? 'Ер' : 'Әйел'} />
                        </div>
                    )}
                </div>

                {/* --- Club Card (Corrected to use REGION) --- */}
                <div className="profile-card">
                    <div className="card-header">
                        <h2>Менің клубым</h2>
                        {!isEditingClub && userInfo?.club && (
                            <button onClick={startEditingClub} className="edit-button"><Edit size={18} /></button>
                        )}
                    </div>
                    {isEditingClub ? (
                        <form onSubmit={handleClubSubmit} className="card-body">
                            <div className="input-wrapper"><Building size={16} className="input-icon" /><input type="text" name="name" placeholder="Клуб атауы" value={clubData.name} onChange={handleClubChange} /></div>
                            <div className="input-wrapper">
                                <MapPin size={16} className="input-icon" />
                                {/* ИСПРАВЛЕНО: select для РЕГИОНА */}
                                <select name="region" value={clubData.region} onChange={handleClubChange}>
                                    <option value="">Облысты таңдаңыз</option>
                                    {kazakhstanRegions.map(reg => <option key={reg} value={reg}>{reg}</option>)}
                                </select>
                            </div>
                           <div className="file-upload-area">
                                {clubData.logo ? (
                                    <div className="logo-preview-wrapper"><img src={clubData.logo} alt="Логотип" /><button type="button" className="remove-logo-button" onClick={() => setClubData({...clubData, logo: ''})}><X size={16}/></button></div>
                                ) : (
                                    <label htmlFor="logoUpload" className="file-upload-label"><UploadCloud size={32} /><span>Логотипті жүктеңіз</span><p>PNG, JPG, SVG</p></label>
                                )}
                                <input type="file" id="logoUpload" onChange={uploadFileHandler} disabled={uploading} style={{ display: 'none' }}/>
                            </div>
                            <button type="submit" className="save-button" disabled={uploading}>{uploading ? 'Жүктелуде...' : <><Save size={18}/> Сақтау</>}</button>
                            {userInfo?.club && <button type="button" className="cancel-button" onClick={() => setIsEditingClub(false)}>Болдырмау</button>}
                        </form>
                    ) : (
                         <div className="card-body view-mode">
                            {userInfo && userInfo.club ? (
                                <>
                                    <div className="club-logo-view">{userInfo.club.logo ? <img src={userInfo.club.logo} alt={`${userInfo.club.name} logo`}/> : <div className="logo-placeholder"><Building/></div>}</div>
                                    <InfoRow icon={<Star size={18}/>} label="Клуб" value={userInfo.club.name} />
                                    {/* ИСПРАВЛЕНО: city -> region */}
                                    <InfoRow icon={<MapPin size={18}/>} label="Облыс" value={userInfo.club.region} />
                                </> 
                            ) : (
                                <div className="empty-state">Клуб туралы ақпарат жоқ. Жаңа клуб қосу үшін өңдеу режиміне өтіңіз.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ... InfoRow component remains the same ...
const InfoRow = ({ icon, label, value }) => (
    <div className="info-row">
        <div className="info-icon-wrapper">{icon}</div>
        <div>
            <span className="info-label">{label}</span>
            <span className="info-value">{value}</span>
        </div>
    </div>
);


export default CoachProfile;
