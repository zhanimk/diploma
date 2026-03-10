
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserPlus, Hash, Mail, Lock, ChevronsRight, Weight, Calendar, MapPin, Phone } from 'lucide-react';
import './RegisterAthletePage.css';

const RegisterAthletePage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        gender: '',
        weight: '',
        dateOfBirth: '',
        city: '',
        club: '',
        phoneNumber: '',
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
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };
                await axios.post('/api/users/coach/register-athlete', formData, config);
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
            // Ошибка уже обработана в toast.promise
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
                        {/* Аты */}
                        <div className="input-group-ra">
                            <ChevronsRight size={18} />
                            <input type="text" name="firstName" placeholder="Аты" value={formData.firstName} onChange={handleChange} required />
                        </div>

                        {/* Тегі */}
                        <div className="input-group-ra">
                            <ChevronsRight size={18} />
                            <input type="text" name="lastName" placeholder="Тегі" value={formData.lastName} onChange={handleChange} required />
                        </div>

                        {/* Email */}
                        <div className="input-group-ra">
                            <Mail size={18} />
                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                        </div>

                        {/* Құпия сөз */}
                        <div className="input-group-ra">
                            <Lock size={18} />
                            <input type="password" name="password" placeholder="Құпия сөз" value={formData.password} onChange={handleChange} required />
                        </div>

                        {/* Жынысы */}
                        <div className="input-group-ra">
                            <ChevronsRight size={18} />
                            <select name="gender" value={formData.gender} onChange={handleChange} required>
                                <option value="">Жынысты таңдаңыз</option>
                                <option value="male">Ер</option>
                                <option value="female">Әйел</option>
                            </select>
                        </div>

                        {/* Салмағы */}
                        <div className="input-group-ra">
                            <Weight size={18} />
                            <input type="number" name="weight" placeholder="Салмағы (кг)" value={formData.weight} onChange={handleChange} required />
                        </div>

                        {/* Туған күні */}
                        <div className="input-group-ra">
                            <Calendar size={18} />
                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                        </div>

                        {/* Қала */}
                        <div className="input-group-ra">
                            <MapPin size={18} />
                            <input type="text" name="city" placeholder="Қала" value={formData.city} onChange={handleChange} />
                        </div>

                        {/* Клуб */}
                        <div className="input-group-ra">
                            <Hash size={18} />
                            <input type="text" name="club" placeholder="Клуб" value={formData.club} onChange={handleChange} />
                        </div>

                        {/* Телефон нөмірі */}
                        <div className="input-group-ra">
                            <Phone size={18} />
                            <input type="tel" name="phoneNumber" placeholder="Телефон нөмірі" value={formData.phoneNumber} onChange={handleChange} />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn-ra" disabled={loading}>
                        {loading ? <span className="loader-spin"></span> : 'Спортшыны тіркеу'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterAthletePage;
