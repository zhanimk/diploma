import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Building, MapPin, Info, Phone, Globe, Image, Save, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { kazakhstanRegions } from '../../../utils/kazakhstanRegions';
import './EditClubPage.css'; 

const EditClubPage = () => {
    const [clubData, setClubData] = useState({
        name: '',
        region: '',
        description: '',
        phone: '',
        address: '',
        website: '',
        logo: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClubData = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get('/api/clubs/my-club');
                if (data) {
                    setClubData({
                        name: data.name || '',
                        region: data.region || '',
                        description: data.description || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        website: data.website || '',
                        logo: data.logo || ''
                    });
                }
            } catch (error) {
                toast.error('Клуб деректерін жүктеу мүмкін болмады.');
                navigate('/coach/dashboard');
            }
            setLoading(false);
        };
        fetchClubData();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClubData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleFileChange = (e) => {
        // This is a placeholder for actual file upload logic
        // For now, we'll just show a preview
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setClubData(prevState => ({ ...prevState, logo: reader.result }));
            };
            reader.readAsDataURL(file);
            // In a real app, you would upload the file here and get back a URL
            toast('Логотипті жүктеу әзірге қолжетімді емес.', { icon: 'ℹ️' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put('/api/clubs/my-club', clubData);
            toast.success('Клуб деректері сәтті жаңартылды!');
            navigate('/coach/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Деректерді сақтау кезінде қате пайда болды.');
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="loading-container">Жүктелуде...</div>;
    }

    return (
        <div className="edit-club-page">
             <header className="page-header">
                <div>
                     <h1>Клуб профилін өңдеу</h1>
                     <p>Клуб туралы ақпаратты жаңартыңыз.</p>
                </div>
                <Link to="/coach/dashboard" className="btn btn-secondary">
                    <ArrowLeft size={18} /> Басқару тақтасына оралу
                </Link>
            </header>

            <form onSubmit={handleSubmit} className="edit-club-form">
                <div className="form-section logo-section">
                    <div className="logo-preview-wrapper">
                        {clubData.logo ? (
                            <img src={clubData.logo} alt="Club Logo" className="logo-preview" />
                        ) : (
                            <div className="logo-placeholder">
                                <Image size={48} />
                                <span>Логотип</span>
                            </div>
                        )}
                    </div>
                     <input type="file" id="logo-upload" onChange={handleFileChange} style={{display: 'none'}} accept="image/*" />
                     <label htmlFor="logo-upload" className="btn btn-tertiary">Логотипті өзгерту</label>
                </div>

                <div className="form-section">
                    <div className="input-row">
                         <div className="input-group-modern">
                            <label htmlFor="name">Клуб атауы</label>
                            <div className="input-wrapper"><Building size={18} /><input id="name" name="name" type="text" placeholder="Мысалы, Judo Club Almaty" value={clubData.name} onChange={handleChange} required /></div>
                        </div>
                        <div className="input-group-modern">
                            <label htmlFor="region">Облыс</label>
                            <div className="input-wrapper"><MapPin size={18} />
                                <select id="region" name="region" value={clubData.region} onChange={handleChange} required>
                                    <option value="">Облысты таңдаңыз</option>
                                    {kazakhstanRegions.map(reg => <option key={reg} value={reg}>{reg}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                     <div className="input-group-modern">
                        <label htmlFor="description">Клуб сипаттамасы</label>
                        <div className="input-wrapper"><Info size={18} /><textarea id="description" name="description" placeholder="Клубтың тарихы, жетістіктері және ерекшеліктері туралы айтып беріңіз." value={clubData.description} onChange={handleChange}></textarea></div>
                    </div>
                    <div className="input-row">
                        <div className="input-group-modern">
                            <label htmlFor="phone">Байланыс телефоны</label>
                            <div className="input-wrapper"><Phone size={18} /><input id="phone" name="phone" type="tel" placeholder="+7 (XXX) XXX-XX-XX" value={clubData.phone} onChange={handleChange} /></div>
                        </div>
                         <div className="input-group-modern">
                            <label htmlFor="address">Мекен-жай</label>
                            <div className="input-wrapper"><MapPin size={18} /><input id="address" name="address" type="text" placeholder="Мысалы, Абай к-сі 52" value={clubData.address} onChange={handleChange} /></div>
                        </div>
                    </div>
                     <div className="input-group-modern">
                        <label htmlFor="website">Веб-сайт</label>
                        <div className="input-wrapper"><Globe size={18} /><input id="website" name="website" type="url" placeholder="https://example.com" value={clubData.website} onChange={handleChange} /></div>
                    </div>
                </div>
                
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        <Save size={18} /> {saving ? 'Сақталуда...' : 'Сақтау'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditClubPage;
