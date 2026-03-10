
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Plus, Trash2, Save, X, ArrowLeft } from 'lucide-react';
import './CreateTournament.css';

const CreateTournament = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [registrationDeadline, setRegistrationDeadline] = useState('');
    const [tatamiCount, setTatamiCount] = useState(1);
    const [categories, setCategories] = useState([
        { gender: 'male', ageFrom: '', ageTo: '', weights: [''] }
    ]);
    const [submitting, setSubmitting] = useState(false);

    const handleCategoryChange = (index, field, value) => {
        const newCategories = [...categories];
        newCategories[index][field] = value;
        setCategories(newCategories);
    };

    const handleWeightChange = (catIndex, weightIndex, value) => {
        const newCategories = [...categories];
        newCategories[catIndex].weights[weightIndex] = value;
        setCategories(newCategories);
    };

    const addWeight = (catIndex) => {
        const newCategories = [...categories];
        newCategories[catIndex].weights.push('');
        setCategories(newCategories);
    };

    const removeWeight = (catIndex, weightIndex) => {
        const newCategories = [...categories];
        if (newCategories[catIndex].weights.length > 1) { // Prevent removing the last weight input
            newCategories[catIndex].weights.splice(weightIndex, 1);
            setCategories(newCategories);
        }
    };

    const addCategory = () => {
        setCategories([...categories, { gender: 'male', ageFrom: '', ageTo: '', weights: [''] }]);
    };

    const removeCategory = (index) => {
        if (categories.length > 1) { // Prevent removing the last category block
            const newCategories = [...categories];
            newCategories.splice(index, 1);
            setCategories(newCategories);
        }
    };

    const validateForm = () => {
        if (!name.trim() || !location.trim() || !date || !registrationDeadline) {
            toast.error('Негізгі турнир ақпаратын толық толтырыңыз.');
            return false;
        }
        if (new Date(registrationDeadline) >= new Date(date)) {
            toast.error('Тіркелу мерзімі турнир басталатын күннен бұрын болуы керек.');
            return false;
        }

        for (const cat of categories) {
            if (cat.ageFrom === '' || cat.ageTo === '' || Number(cat.ageFrom) >= Number(cat.ageTo)) {
                toast.error(`Категориядағы жас аралығы дұрыс көрсетілмеген.`);
                return false;
            }
            const validWeights = cat.weights.map(w => Number(w)).filter(w => !isNaN(w) && w > 0);
            if (validWeights.length === 0) {
                toast.error(`Әр категорияда кем дегенде бір жарамды салмақ дәрежесі болуы керек.`);
                return false;
            }
        }
        return true;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const processedCategories = categories.map(cat => ({
            gender: cat.gender,
            ageFrom: Number(cat.ageFrom),
            ageTo: Number(cat.ageTo),
            weights: cat.weights.map(w => Number(w)).filter(w => !isNaN(w) && w > 0)
        })).filter(cat => cat.weights.length > 0);

        const tournamentData = {
            name, date, location, registrationDeadline,
            tatamiCount: Number(tatamiCount),
            categories: processedCategories,
            status: 'PLANNED' // Set default status on creation
        };

        setSubmitting(true);
        const promise = axios.post('/api/tournaments', tournamentData, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => {
                navigate('/admin/tournaments');
                return `Турнир "${res.data.name}" сәтті құрылды`;
            })
            .catch(err => {
                const errorMessage = err.response?.data?.message || 'Турнирді құру кезінде белгісіз қате пайда болды.';
                throw new Error(errorMessage);
            })
            .finally(() => setSubmitting(false));

        toast.promise(promise, {
            loading: 'Турнир құрылуда...',
            success: (message) => <b>{message}</b>,
            error: (err) => <b>{err.toString()}</b>
        });
    };

    return (
        <div className="create-tournament-container admin-container">
            <header className="page-header">
                 <button onClick={() => navigate(-1)} className="btn-back">
                    <ArrowLeft size={20} />
                </button>
                <h1><Calendar size={28} /> Жаңа турнир құру</h1>
            </header>

            <form onSubmit={handleSubmit} className="create-tournament-form" noValidate>
                
                <div className="form-section">
                    <h2>Жалпы ақпарат</h2>
                    <div className="form-grid-basic">
                        <div className="form-group">
                            <label>Турнир атауы</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Өткізілетін орны</label>
                            <input type="text" value={location} onChange={e => setLocation(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Өткізілетін күні</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Тіркелудің соңғы мерзімі</label>
                            <input type="date" value={registrationDeadline} onChange={e => setRegistrationDeadline(e.target.value)} required />
                        </div>
                         <div className="form-group">
                            <label>Татами саны</label>
                            <input type="number" value={tatamiCount} onChange={e => setTatamiCount(e.target.value)} min="1" required />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Категориялар мен салмақтар</h2>
                    {categories.map((cat, catIndex) => (
                        <div key={catIndex} className="category-block">
                            <div className="category-header">
                                <h3>Категория #{catIndex + 1}</h3>
                                <button type="button" onClick={() => removeCategory(catIndex)} className="btn-remove-category">
                                    <Trash2 size={16} /> Жою
                                </button>
                            </div>
                            <div className="category-grid">
                                <div className="form-group">
                                    <label>Жынысы</label>
                                    <select value={cat.gender} onChange={e => handleCategoryChange(catIndex, 'gender', e.target.value)}>
                                        <option value="male">Ер</option>
                                        <option value="female">Әйел</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Жас (бастапқы)</label>
                                    <input type="number" placeholder='Мыс: 11' value={cat.ageFrom} onChange={e => handleCategoryChange(catIndex, 'ageFrom', e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Жас (соңғы)</label>
                                    <input type="number" placeholder='Мыс: 12' value={cat.ageTo} onChange={e => handleCategoryChange(catIndex, 'ageTo', e.target.value)} required />
                                </div>
                            </div>
                            <h4>Салмақ дәрежелері (кг)</h4>
                            <div className="weights-grid">
                                {cat.weights.map((weight, weightIndex) => (
                                    <div key={weightIndex} className="weight-input">
                                        <input type="number" step="0.1" placeholder='Мыс: 45' value={weight} onChange={e => handleWeightChange(catIndex, weightIndex, e.target.value)} required/>
                                        <button type="button" onClick={() => removeWeight(catIndex, weightIndex)}><X size={16}/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addWeight(catIndex)} className="btn-add-weight">
                                    <Plus size={16} /> Салмақ қосу
                                </button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addCategory} className="btn-add-category">
                        <Plus size={18} /> Жаңа категория қосу
                    </button>
                </div>
                
                <div className="form-actions">
                     <button type="button" onClick={() => navigate('/admin/tournaments')} className="btn-cancel">
                        Болдырмау
                    </button>
                    <button type="submit" className="btn-submit" disabled={submitting}>
                        <Save size={18} />
                        {submitting ? 'Сақталуда...' : 'Турнирді құру'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTournament;
