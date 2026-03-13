import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Calendar, MapPin, Weight, Shield, ArrowLeft } from 'lucide-react';
import './EditAthletePage.css'; 

const InputField = ({ icon, ...props }) => (
    <div className="input-group-v2">
        <div className="input-group-v2__icon">{icon}</div>
        <input className="input-group-v2__input" {...props} />
    </div>
);

const EditAthletePage = () => {
    const { athleteId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        city: '',
        rank: '',
        weight: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAthlete = async () => {
            try {
                const { data } = await axios.get(`/api/users/${athleteId}`);
                setFormData({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
                    city: data.city || '',
                    rank: data.rank || '',
                    weight: data.weight || ''
                });
            } catch (err) {
                setError('Спортсмен туралы деректерді алу мүмкін болмады.');
                toast.error('Спортсмен туралы деректерді алу мүмкін болмады.');
            } finally {
                setLoading(false);
            }
        };

        fetchAthlete();
    }, [athleteId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.put(`/api/users/update-athlete/${athleteId}`, formData);
            toast.success('Профиль сәтті жаңартылды!');
            navigate('/coach/my-athletes');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Профильді жаңарту мүмкін болмады.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/coach/my-athletes');
    }

    if (error) return <div className="error-page-message">{error}</div>;
    if (loading && !formData.firstName) return <div className="loading-page-indicator">Жүктелуде...</div>; 


    return (
        <div className="edit-athlete-page-layout">
            <div className="edit-athlete-container">
                <button onClick={handleCancel} className="btn-back">
                    <ArrowLeft size={20} />
                    <span>Артқа</span>
                </button>
                
                <header className="edit-athlete-header">
                    <h1>Спортсмен профилін өңдеу</h1>
                    <p>Бұл жерде сіз спортшының профиль ақпаратын жаңарта аласыз.</p>
                </header>

                <form onSubmit={handleSubmit} className="edit-athlete-form">
                    <div className="form-row">
                        <InputField icon={<User size={20} />} type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Аты" required />
                        <InputField icon={<User size={20} />} type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Тегі" required />
                    </div>
                    <InputField icon={<Calendar size={20} />} type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                    <div className="form-row">
                        <InputField icon={<MapPin size={20} />} type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Қала" />
                        <InputField icon={<Shield size={20} />} type="text" name="rank" value={formData.rank} onChange={handleChange} placeholder="Дәреже" />
                    </div>
                    <InputField icon={<Weight size={20} />} type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Салмағы (кг)" />

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
                            Болдырмау
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Жаңартылуда...' : 'Профильді жаңарту'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAthletePage;
