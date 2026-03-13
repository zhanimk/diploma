
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTournamentById, updateTournament, resetTournament } from '../../../store/tournamentSlice';
import axios from 'axios'; // For file upload
import toast from 'react-hot-toast';
import { Save, X, ArrowLeft, UploadCloud, FileText, Edit, Plus, Trash2 } from 'lucide-react';
import './CreateTournamentModal.css'; // Reusing the modal styles

const EditTournament = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();

    const { tournament, loading, error } = useSelector((state) => state.tournaments);

    // Local state for form fields
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [registrationDeadline, setRegistrationDeadline] = useState('');
    const [tatamiCount, setTatamiCount] = useState(1);
    const [categories, setCategories] = useState([{ gender: 'male', ageFrom: '', ageTo: '', weights: [''] }]);
    const [regulationsFile, setRegulationsFile] = useState(null);
    const [existingPdfPath, setExistingPdfPath] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        dispatch(getTournamentById(id));
        return () => {
            dispatch(resetTournament());
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (tournament) {
            setName(tournament.name || '');
            setLocation(tournament.location || '');
            setTatamiCount(tournament.tatamiCount || 1);
            setDate(tournament.startDate ? new Date(tournament.startDate).toISOString().split('T')[0] : '');
            setRegistrationDeadline(tournament.registrationEndDate ? new Date(tournament.registrationEndDate).toISOString().split('T')[0] : '');
            // Ensure categories is always an array, and weights in each category is also an array
            const initialCategories = tournament.categories && tournament.categories.length > 0
                ? tournament.categories.map(c => ({...c, weights: c.weights || ['']}))
                : [{ gender: 'male', ageFrom: '', ageTo: '', weights: [''] }];
            setCategories(initialCategories);
            setExistingPdfPath(tournament.regulationsPdf || '');
        }
    }, [tournament]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setRegulationsFile(file);
            setExistingPdfPath(''); // Clear existing path when new file is chosen
        } else {
            toast.error('Тек PDF файлдар рұқсат етілген.');
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
        setCategories([...categories, { gender: 'male', ageFrom: '', ageTo: '', weights: [''] }]);
    };

    const removeCategory = (index) => {
        if (categories.length > 1) {
            const newCategories = [...categories];
            newCategories.splice(index, 1);
            setCategories(newCategories);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        let uploadedPdfPath = existingPdfPath;

        const updatePromise = new Promise(async (resolve, reject) => {
            try {
                if (regulationsFile) {
                    const formData = new FormData();
                    formData.append('document', regulationsFile);
                    const { data } = await axios.post('/api/upload/pdf', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                    uploadedPdfPath = data.path;
                }

                const processedCategories = categories.map(cat => ({
                    gender: cat.gender,
                    ageFrom: Number(cat.ageFrom),
                    ageTo: Number(cat.ageTo),
                    weights: cat.weights.map(w => String(w).trim()).filter(w => w).map(w => Number(w))
                })).filter(cat => cat.weights.length > 0);

                const tournamentData = {
                    name,
                    startDate: date,
                    location,
                    registrationEndDate: registrationDeadline,
                    tatamiCount: Number(tatamiCount),
                    categories: processedCategories,
                    regulationsPdf: uploadedPdfPath,
                };

                await dispatch(updateTournament({ id, tournamentData })).unwrap();
                
                navigate('/admin/tournaments');
                resolve(`Турнир "${name}" сәтті жаңартылды`);

            } catch (error) {
                console.error('Update tournament error:', error);
                reject(error.message || 'Турнирді жаңарту қатесі.');
            }
        });

        toast.promise(updatePromise, {
            loading: 'Турнир жаңартылуда...',
            success: (message) => <b>{message}</b>,
            error: (err) => <b>{err}</b>
        }).finally(() => setSubmitting(false));
    };
    
    if (loading && !tournament) return <p>Загрузка данных турнира...</p>;
    if (error) return <p style={{ color: 'red' }}>Ошибка: {error.message || 'Не удалось загрузить турнир'}</p>;

    return (
        <div className="create-tournament-container admin-container">
            <header className="page-header">
                 <button onClick={() => navigate(-1)} className="btn-back"><ArrowLeft size={20} /></button>
                <h1><Edit size={28} /> Турнирді редакциялау</h1>
            </header>

            {tournament && <form onSubmit={handleSubmit} className="create-tournament-form" noValidate>
                 <div className="form-section">
                    <h2>Жалпы ақпарат</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name">Турнир атауы</label>
                            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="location">Өтетін орны</label>
                            <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="date">Өтетін күні</label>
                            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="registration-deadline">Тіркелудің соңғы күні</label>
                            <input id="registration-deadline" type="date" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} required />
                        </div>
                         <div className="form-group">
                            <label htmlFor="tatami-count">Татами саны</label>
                            <input id="tatami-count" type="number" min="1" value={tatamiCount} onChange={(e) => setTatamiCount(e.target.value)} required />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Регламент (PDF)</h2>
                     <div className="form-group file-upload-group">
                        <label htmlFor="regulations-file-upload" className="file-upload-label">
                            <UploadCloud size={20} />
                            <span>{regulationsFile ? regulationsFile.name : (existingPdfPath ? 'Жаңа файл таңдау' : 'PDF файлын таңдаңыз')}</span>
                        </label>
                        <input id="regulations-file-upload" type="file" accept=".pdf" onChange={handleFileChange} />
                        {(regulationsFile || existingPdfPath) && (
                            <div className="file-preview">
                                <FileText size={40} />
                                <p>{regulationsFile ? regulationsFile.name : existingPdfPath.split('-').slice(1).join('-')}</p>
                                <button type="button" onClick={() => {setRegulationsFile(null); setExistingPdfPath('');}}><X size={16}/></button>
                            </div>
                        )}
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
                                <div className="form-group">
                                    <label>Жынысы</label>
                                    <select value={cat.gender} onChange={(e) => handleCategoryChange(catIndex, 'gender', e.target.value)}>
                                        <option value="male">Ерлер</option>
                                        <option value="female">Әйелдер</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Жас (бастап)</label>
                                    <input type="number" value={cat.ageFrom} onChange={(e) => handleCategoryChange(catIndex, 'ageFrom', e.target.value)} placeholder="Мысалы: 14" />
                                </div>
                                <div className="form-group">
                                    <label>Жас (дейін)</label>
                                    <input type="number" value={cat.ageTo} onChange={(e) => handleCategoryChange(catIndex, 'ageTo', e.target.value)} placeholder="Мысалы: 16" />
                                </div>
                                <div className="weights-group">
                                    <label>Салмақ дәрежелері (кг)</label>
                                    <div className="weights-list">
                                    {cat.weights.map((weight, weightIndex) => (
                                        <div key={weightIndex} className="weight-input-group">
                                            <input type="text" value={weight} onChange={(e) => handleWeightChange(catIndex, weightIndex, e.target.value)} placeholder="Мысалы: 60" />
                                            <button type="button" onClick={() => removeWeight(catIndex, weightIndex)}><X size={16} /></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addWeight(catIndex)} className="btn-add-weight"><Plus size={16} /> Салмақ қосу</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addCategory} className="btn-add-category"><Plus size={20} /> Жаңа категория қосу</button>
                </div>

                 <div className="form-actions">
                    <button type="button" onClick={() => navigate('/admin/tournaments')} className="btn-cancel"><X size={18} /> Болдырмау</button>
                    <button type="submit" className="btn-submit" disabled={submitting}><Save size={18} /> {submitting ? 'Сақталуда...' : 'Өзгерістерді сақтау'}</button>
                </div>
            </form>}
        </div>
    );
};

export default EditTournament;
