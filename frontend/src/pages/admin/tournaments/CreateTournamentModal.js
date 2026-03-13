import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Plus, Trash2, Save, X, UploadCloud } from 'lucide-react';
import './CreateTournamentModal.css';

const CreateTournamentModal = ({ isOpen, onClose, onTournamentCreated }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [registrationDeadline, setRegistrationDeadline] = useState('');
    const [tatamiCount, setTatamiCount] = useState(1);
    const [categories, setCategories] = useState([
        { gender: 'male', yearFrom: '', yearTo: '', weights: [''] }
    ]);
    const [regulationsFile, setRegulationsFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setName('');
            setStartDate('');
            setEndDate('');
            setLocation('');
            setRegistrationDeadline('');
            setTatamiCount(1);
            setCategories([{ gender: 'male', yearFrom: '', yearTo: '', weights: [''] }]);
            setRegulationsFile(null);
            setSubmitting(false);
        }
    }, [isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            setRegulationsFile(file);
        } else {
            toast.error('Тек PDF немесе Word файлдары рұқсат етілген.');
            e.target.value = null;
        }
    };

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
        if (newCategories[catIndex].weights.length > 1) {
            newCategories[catIndex].weights.splice(weightIndex, 1);
            setCategories(newCategories);
        }
    };

    const addCategory = () => {
        setCategories([...categories, { gender: 'male', yearFrom: '', yearTo: '', weights: [''] }]);
    };

    const removeCategory = (index) => {
        if (categories.length > 1) {
            const newCategories = [...categories];
            newCategories.splice(index, 1);
            setCategories(newCategories);
        }
    };

    const validateForm = () => {
        if (!name || !startDate || !endDate || !location || !registrationDeadline) {
            toast.error('Барлық негізгі ақпарат өрістерін толтырыңыз.');
            return false;
        }
        if (new Date(startDate) > new Date(endDate)) {
            toast.error('Аяқталу күні басталу күнінен ерте бола алмайды.');
            return false;
        }
        if (new Date(registrationDeadline) > new Date(startDate)) {
            toast.error('Тіркелу дедлайны турнир басталғаннан кейін бола алмайды.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        const creationPromise = new Promise(async (resolve, reject) => {
            try {
                let uploadedPdfPath = '';
                if (regulationsFile) {
                    const formData = new FormData();
                    formData.append('document', regulationsFile);
                    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
                    const { data } = await axios.post('/api/upload/pdf', formData, config);
                    uploadedPdfPath = data.path;
                }

                const processedCategories = categories.map(cat => ({
                    gender: cat.gender,
                    yearFrom: Number(cat.yearFrom),
                    yearTo: Number(cat.yearTo),
                    weights: cat.weights.map(w => String(w).trim()).filter(w => w).map(w => Number(w.replace('+', '')))
                })).filter(cat => cat.weights.length > 0 && cat.yearFrom && cat.yearTo);

                if (processedCategories.length === 0) {
                   throw new Error('Ең болмағанда бір дұрыс толтырылған категорияны енгізіңіз.');
                }

                const tournamentData = {
                    name,
                    startDate,
                    endDate,
                    location,
                    registrationDeadline,
                    tatamiCount: Number(tatamiCount),
                    categories: processedCategories,
                    regulationsPdf: uploadedPdfPath || undefined,
                };
                
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };

                await axios.post('/api/tournaments', tournamentData, config);
                
                onTournamentCreated();
                onClose();
                resolve(`"${name}" турнирі сәтті құрылды`);

            } catch (error) {
                console.error('Турнир құру қатесі:', error.response?.data?.message || error.message);
                reject(error.response?.data?.message || 'Турнирді құру кезінде қате пайда болды.');
            }
        });

        toast.promise(creationPromise, {
            loading: 'Турнир құрылуда...',
            success: (message) => <b>{message}</b>,
            error: (err) => <b>{err}</b>
        }).finally(() => setSubmitting(false));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content create-tournament-modal">
                <header className="modal-header">
                    <h1><Calendar size={24} /> Жаңа турнир құру</h1>
                    <button onClick={onClose} className="btn-close-modal"><X size={24} /></button>
                </header>

                <form onSubmit={handleSubmit} className="create-tournament-form" noValidate>
                    <div className="form-body">
                        <div className="form-section">
                            <h2>Жалпы ақпарат</h2>
                            <div className="form-grid-three">
                                <div className="form-group"><label>Атауы</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                                <div className="form-group"><label>Өтетін орны</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required /></div>
                                <div className="form-group"><label>Татами саны</label><input type="number" min="1" value={tatamiCount} onChange={(e) => setTatamiCount(e.target.value)} required /></div>
                                <div className="form-group"><label>Басталу күні</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></div>
                                <div className="form-group"><label>Аяқталу күні</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required /></div>
                                <div className="form-group"><label>Тіркелу дедлайны</label><input type="datetime-local" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} required /></div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h2>Регламент (PDF, Word)</h2>
                            <div className="form-group file-upload-group">
                                <label htmlFor="regulations-file-upload" className="file-upload-label">
                                    <UploadCloud size={20} />
                                    <span>{regulationsFile ? regulationsFile.name : 'Файлды таңдаңыз...'}</span>
                                </label>
                                <input id="regulations-file-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                            </div>
                        </div>

                        <div className="form-section">
                            <h2>Категориялар мен салмақтар</h2>
                            {categories.map((cat, catIndex) => (
                                <div key={catIndex} className="category-group">
                                    <div className="category-header">
                                        <h3>Категория #{catIndex + 1}</h3>
                                        <button type="button" onClick={() => removeCategory(catIndex)} className="btn-remove-category"><Trash2 size={16} /></button>
                                    </div>
                                    <div className="category-body">
                                        <div className="form-group"><label>Жынысы</label><select value={cat.gender} onChange={(e) => handleCategoryChange(catIndex, 'gender', e.target.value)}><option value="male">Ерлер</option><option value="female">Әйелдер</option></select></div>
                                        <div className="form-group"><label>Туған жылы (бастап)</label><input type="number" value={cat.yearFrom} onChange={(e) => handleCategoryChange(catIndex, 'yearFrom', e.target.value)} placeholder="2010" /></div>
                                        <div className="form-group"><label>Туған жылы (дейін)</label><input type="number" value={cat.yearTo} onChange={(e) => handleCategoryChange(catIndex, 'yearTo', e.target.value)} placeholder="2012" /></div>
                                        <div className="weights-group">
                                            <label>Салмақтар</label>
                                            <div className="weights-list">
                                            {cat.weights.map((weight, weightIndex) => (
                                                <div key={weightIndex} className="weight-input-group">
                                                    <input type="text" value={weight} onChange={(e) => handleWeightChange(catIndex, weightIndex, e.target.value)} placeholder="66" />
                                                    <button type="button" onClick={() => removeWeight(catIndex, weightIndex)}><X size={16} /></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addWeight(catIndex)} className="btn-add-weight"><Plus size={16} /> қосу</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addCategory} className="btn-add-category"><Plus size={20} /> Категория қосу</button>
                        </div>
                    </div>
                    
                    <footer className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-cancel"><X size={18} /> Болдырмау</button>
                        <button type="submit" className="btn-submit" disabled={submitting}><Save size={18} /> {submitting ? 'Сақталуда...' : 'Сақтау'}</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default CreateTournamentModal;
