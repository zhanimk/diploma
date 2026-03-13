
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserPlus, Mail, Lock, ChevronsRight, Weight, Calendar, MapPin, Shield } from 'lucide-react';
import './AddAthletePage.css';

const AddAthletePage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        gender: '',
        weight: '',
        dateOfBirth: '',
        city: '',
        rank: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const registrationPromise = new Promise(async (resolve, reject) => {
            try {
                // Get auth token from local storage
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo || !userInfo.token) {
                    throw new Error('You must be logged in to register an athlete.');
                }

                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };

                // Post to the correct, authenticated route
                await axios.post('/api/clubs/register-athlete', formData, config);
                resolve('Спортшы сәтті тіркелді!');
                setTimeout(() => {
                    navigate('/coach/my-athletes');
                }, 1500);
            } catch (error) {
                const message = error.response?.data?.message || 'Тіркелу кезінде қате пайда болды.';
                reject(message);
            }
        });

        toast.promise(registrationPromise, {
            loading: 'Спортшы тіркелуде...',
            success: (message) => <b>{message}</b>,
            error: (err) => <b>{err.toString()}</b>,
        });

        try {
            await registrationPromise;
        } catch (error) {
            // The error is already handled by toast.promise
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-athlete-container">
            <div className="register-athlete-card">
                <div className="page-header">
                    <h1><UserPlus size={32} /> Жаңа спортшыны тіркеу</h1>
                    <p>Спортшының профилін жасау үшін деректерді енгізіңіз. Ол автоматты түрде сіздің командаңызға қосылады.</p>
                </div>

                <form onSubmit={handleSubmit} className="register-athlete-form">
                    <div className="form-grid">
                        <div className="input-group-ra">
                            <ChevronsRight size={18} />
                            <input type="text" name="firstName" placeholder="Аты" value={formData.firstName} onChange={handleChange} required />
                        </div>

                        <div className="input-group-ra">
                            <ChevronsRight size={18} />
                            <input type="text" name="lastName" placeholder="Тегі" value={formData.lastName} onChange={handleChange} required />
                        </div>

                        <div className="input-group-ra">
                            <Mail size={18} />
                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="input-group-ra">
                            <Lock size={18} />
                            <input type="password" name="password" placeholder="Құпия сөз" value={formData.password} onChange={handleChange} required />
                        </div>

                        <div className="input-group-ra">
                            <ChevronsRight size={18} />
                            <select name="gender" value={formData.gender} onChange={handleChange} required>
                                <option value="">Жынысты таңдаңыз</option>
                                <option value="male">Ер</option>
                                <option value="female">Әйел</option>
                            </select>
                        </div>

                        <div className="input-group-ra">
                            <Weight size={18} />
                            <input type="number" name="weight" placeholder="Салмағы (кг)" value={formData.weight} onChange={handleChange} />
                        </div>

                        <div className="input-group-ra">
                            <Calendar size={18} />
                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                        </div>

                        <div className="input-group-ra">
                            <MapPin size={18} />
                            <input type="text" name="city" placeholder="Қала" value={formData.city} onChange={handleChange} />
                        </div>

                        <div className="input-group-ra">
                            <Shield size={18} />
                            <input type="text" name="rank" placeholder="Дәрежесі" value={formData.rank} onChange={handleChange} />
                        </div>
                    </div>

                     <div className="form-actions-ra">
                        <Link to="/coach/my-athletes" className="back-button-ra">Артқа</Link>
                        <button type="submit" className="submit-btn-ra" disabled={loading}>
                            {loading ? <span className="loader-spin"></span> : 'Спортшыны тіркеу'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAthletePage;
