import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, Trash2, AlertTriangle } from 'lucide-react';
import './SettingsTab.css';

const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return userInfo ? userInfo.token : null;
};

const SettingsTab = ({ tournament, onTournamentUpdate }) => {
    const navigate = useNavigate();
    const [name, setName] = useState(tournament.name);
    const [status, setStatus] = useState(tournament.status);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (name === tournament.name && status === tournament.status) {
            toast.error('Сақтау үшін өзгерістер жоқ.');
            return;
        }
        setIsSubmitting(true);
        try {
            const { data } = await axios.put(`/api/tournaments/${tournament._id}`, { name, status }, { headers: { Authorization: `Bearer ${getToken()}` } });
            onTournamentUpdate(data);
            toast.success('Турнир баптаулары сәтті жаңартылды!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Жаңарту кезінде қате пайда болды.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        const confirm = window.prompt('Бұл әрекетті болдырмау мүмкін емес. Турнирдің барлық деректері (өтінімдер, торлар, нәтижелер) жойылады. Растау үшін турнир атауын енгізіңіз: ');
        if (confirm !== tournament.name) {
            toast.error('Турнир атауы қате енгізілді. Жою болдырылмады.');
            return;
        }
        try {
            await axios.delete(`/api/tournaments/${tournament._id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
            toast.success('Турнир сәтті жойылды.');
            navigate('/admin/tournaments');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Жою кезінде қате пайда болды.');
        }
    };

    return (
        <div className="settings-tab-container">
            <form onSubmit={handleUpdate} className="settings-form">
                <h3>Негізгі баптаулар</h3>
                <div className="form-group">
                    <label htmlFor="tournamentName">Турнир атауы</label>
                    <input 
                        type="text" 
                        id="tournamentName" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="tournamentStatus">Турнир мәртебесі</label>
                    <select 
                        id="tournamentStatus"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="PLANNED">Жоспарлануда</option>
                        <option value="REGISTRATION_OPEN">Тіркеу ашық</option>
                        <option value="REGISTRATION_CLOSED">Тіркеу жабық</option>
                        <option value="GRID_GENERATED">Торлар құрылды</option>
                        <option value="ONGOING">Жүріп жатыр</option>
                        <option value="COMPLETED">Аяқталды</option>
                        <option value="ARCHIVED">Мұрағатта</option>
                    </select>
                </div>
                <button type="submit" className="save-btn" disabled={isSubmitting}>
                    <Save size={18} /> {isSubmitting ? 'Сақталуда...' : 'Сақтау'}
                </button>
            </form>

            <div className="danger-zone">
                <h3><AlertTriangle size={20}/> Қауіпті аймақ</h3>
                <p>Бұл әрекеттердің қайтымсыз салдары болуы мүмкін.</p>
                <div className="danger-action">
                    <div>
                        <strong>Турнирді жою</strong>
                        <span>Бұл әрекет барлық байланысты деректерді жояды.</span>
                    </div>
                    <button onClick={handleDelete} className="delete-btn">
                        <Trash2 size={18} /> Турнирді жою
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
