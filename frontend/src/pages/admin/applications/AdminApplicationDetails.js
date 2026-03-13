
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Check, X, Download, User, Weight, Cake, Save, Edit, Info, Calendar, MapPin, Users, Shield } from 'lucide-react';

import { 
    getApplicationDetails, 
    updateApplicationStatus, 
    updateAthleteInApplication 
} from '../../../store/applicationSlice';

import './AdminApplicationDetails.css';

// ### Компонент AthleteRow ###
// Этот компонент остаётся почти без изменений, так как его внутреннее состояние 
// (редактирование, временные значения инпутов) является локальным.
// Единственное изменение - функция onUpdate теперь будет вызывать dispatch.
const AthleteRow = ({ athleteEntry, application, onUpdate }) => {
    const [actualWeight, setActualWeight] = useState(athleteEntry.actualWeight || '');
    const [selectedWeightCategory, setSelectedWeightCategory] = useState(athleteEntry.weightCategory);
    const [isVerified, setIsVerified] = useState(athleteEntry.isVerifiedByAdmin || false);
    const [isEditing, setIsEditing] = useState(false);

    const tournamentCategories = application.tournament?.categories || [];
    const athleteGender = athleteEntry.athlete.gender;
    
    const tournamentDate = new Date(application.tournament.date);
    const birthDate = new Date(athleteEntry.athlete.dateOfBirth);
    let athleteAge = tournamentDate.getFullYear() - birthDate.getFullYear();
    const m = tournamentDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && tournamentDate.getDate() < birthDate.getDate())) {
        athleteAge--;
    }

    const relevantCategory = tournamentCategories.find(c => {
        const ageCat = c.age;
        return athleteAge >= ageCat.from && athleteAge <= ageCat.to && c.gender === athleteGender;
    });
   
    const availableWeights = relevantCategory ? relevantCategory.weights : [];
    
    const handleUpdate = () => {
        const payload = {
            actualWeight: parseFloat(actualWeight) || null,
            weightCategory: selectedWeightCategory,
            isVerifiedByAdmin: isVerified,
        };
        // Вызываем onUpdate, который теперь будет диспатчить Redux action
        onUpdate(athleteEntry._id, payload);
        setIsEditing(false);
    };

    const medLink = athleteEntry.documents?.find(d => d.docType === 'MEDICAL_CERTIFICATE')?.url;
    const insLink = athleteEntry.documents?.find(d => d.docType === 'INSURANCE')?.url;

    return (
        <tr>
            <td><User size={16}/> {`${athleteEntry.athlete?.firstName} ${athleteEntry.athlete?.lastName}`}</td>
            <td><Cake size={16}/> {new Date(athleteEntry.athlete.dateOfBirth).toLocaleDateString()} ({athleteAge} жас)</td>
            <td className="weight-cell">
                {isEditing ? (
                    <div className='edit-mode'>
                         <select
                            value={selectedWeightCategory}
                            onChange={e => setSelectedWeightCategory(e.target.value)}
                        >
                            <option value="">Категорияны таңдаңыз</option>
                            {availableWeights.map(w => <option key={w.weight} value={w.weight}>{w.weight} кг дейін</option>)}
                        </select>
                        <input 
                            type="number" 
                            step="0.1" 
                            placeholder="Нақты салмақ"
                            value={actualWeight}
                            onChange={e => setActualWeight(e.target.value)}
                        />
                    </div>
                ) : (
                    <div className='view-mode'>
                        <span className='category-badge'>{athleteEntry.weightCategory} кг</span>
                        {athleteEntry.actualWeight && <span className='actual-weight-badge'><Weight size={14}/>{athleteEntry.actualWeight} кг</span>}
                    </div>
                )}
            </td>
            <td className="documents-cell">
                 {medLink ? <a href={medLink} target="_blank" rel="noopener noreferrer" className="document-link"><Download size={16}/> Мед.</a> : <span className="document-missing">Жоқ</span>}
                 {insLink ? <a href={insLink} target="_blank" rel="noopener noreferrer" className="document-link"><Download size={16}/> Сақт.</a> : <span className="document-missing">Жоқ</span>}
            </td>
            <td className="verification-cell">
                <label className="switch">
                    <input 
                        type="checkbox" 
                        checked={isVerified}
                        onChange={(e) => setIsVerified(e.target.checked)}
                        disabled={!isEditing}
                    />
                    <span className="slider round"></span>
                </label>
            </td>
            <td className="action-buttons">
                {isEditing ? (
                    <button onClick={handleUpdate} className="btn-action btn-save" title="Сақтау">
                        <Save size={18} />
                    </button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="btn-action btn-edit" title="Өзгерту">
                        <Edit size={18} />
                    </button>
                )}
            </td>
        </tr>
    );
};


// ### Основной компонент AdminApplicationDetails ###
const AdminApplicationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Получаем данные из Redux store
    const { selectedApplication: application, loading, error } = useSelector(state => state.applications);

    // Загружаем данные при монтировании компонента
    useEffect(() => {
        dispatch(getApplicationDetails(id))
            .unwrap()
            .catch(err => {
                toast.error(err || 'Өтінімді жүктеу кезінде қате.');
                navigate('/admin/applications');
            });
    }, [dispatch, id, navigate]);

    // Функция обновления данных спортсмена (теперь диспатчит action)
    const handleAthleteUpdate = (athleteEntryId, payload) => {
        const promise = dispatch(updateAthleteInApplication({ applicationId: id, athleteEntryId, payload }))
            .unwrap()
            .then(() => "Спортшы деректері сәтті жаңартылды")
            .catch(err => {
                throw new Error(err || "Жаңарту кезінде қате пайда болды");
            });

        toast.promise(promise, {
            loading: 'Жаңартылуда...',
            success: (message) => <b>{message}</b>,
            error: (err) => <b>{err.toString()}</b>,
        });
    };
    
    // Функция обновления статуса заявки (теперь диспатчит action)
    const handleUpdateStatus = (newStatus) => {
        const isConfirmed = window.confirm(`Сіз бұл өтінімнің мәртебесін "${newStatus === 'APPROVED' ? 'Қабылданды' : 'Қабылданбады'}" деп өзгерткіңіз келетініне сенімдісіз бе?`);
        if (!isConfirmed) return;

        const promise = dispatch(updateApplicationStatus({ id, status: newStatus }))
            .unwrap()
            .then(() => `Мәртебе сәтті "${newStatus === 'APPROVED' ? 'Қабылданды' : 'Қабылданбады'}" болып өзгертілді.`)
            .catch(err => {
                throw new Error(err || "Мәртебені жаңарту кезінде қате.");
            });
            
        toast.promise(promise, {
            loading: 'Мәртебе жаңартылуда...',
            success: (message) => <b>{message}</b>,
            error: (err) => <b>{err.toString()}</b>,
        });
    }
    
    if (loading || !application) {
        return <div className="loading-indicator">Жүктелуде...</div>;
    }

    if (error) {
        return <div className="error-indicator">Қате: {error}</div>;
    }
    
    const getStatusInfo = (status) => {
        const statusMap = {
            PENDING: { text: 'Күтілуде', className: 'status-pending' },
            APPROVED: { text: 'Қабылданды', className: 'status-approved' },
            REJECTED: { text: 'Қабылданбады', className: 'status-rejected' },
        };
        return statusMap[status] || statusMap.PENDING;
    };
    
    const statusInfo = getStatusInfo(application.status);

    return (
        <div className="application-details-container admin-container">
            <header className="details-header">
                <Link to="/admin/applications" className="back-link"><ArrowLeft size={20} /> Артқа</Link>
                <h1>Өтінім #{application._id.substring(0, 7)}</h1>
                <div className="header-actions">
                    <button onClick={() => handleUpdateStatus('APPROVED')} className="btn btn-success" disabled={application.status === 'APPROVED'}>
                        <Check size={18}/> Қабылдау
                    </button>
                    <button onClick={() => handleUpdateStatus('REJECTED')} className="btn btn-danger" disabled={application.status === 'REJECTED'}>
                        <X size={18}/> Қабылдамау
                    </button>
                </div>
            </header>

            <section className="details-grid">
                <div className="detail-card tournament-card">
                    <h3><Info size={20}/> Турнир туралы ақпарат</h3>
                    <p><strong><User size={16}/> Атауы:</strong> {application.tournament?.name}</p>
                    <p><strong><Calendar size={16}/> Күні:</strong> {new Date(application.tournament?.date).toLocaleDateString()}</p>
                    <p><strong><MapPin size={16}/> Өтетін орны:</strong> {application.tournament?.location}</p>
                </div>
                <div className="detail-card coach-card">
                    <h3><Users size={20}/> Команда және тренер</h3>
                    <p><strong>Аты-жөні:</strong> {`${application.coach?.user?.firstName} ${application.coach?.user?.lastName}`}</p>
                    <p><strong>Клуб:</strong> {application.coach?.club?.name}</p>
                    <p><strong>Телефон:</strong> {application.coach?.user?.phone}</p>
                </div>
                 <div className="detail-card status-card">
                    <h3><Shield size={20}/> Ағымдағы мәртебе</h3>
                    <p className={`status-badge-large ${statusInfo.className}`}>
                        {statusInfo.text}
                    </p>
                    <small>Соңғы жаңарту: {new Date(application.updatedAt).toLocaleString()}</small>
                </div>
            </section>

            <section className="athletes-section">
                 <h2><User size={24}/> Тіркелген спортшылар ({application.athletes?.length || 0})</h2>
                <div className="athletes-table-container">
                    <table className="athletes-table">
                        <thead>
                            <tr>
                                <th>Аты-жөні</th>
                                <th>Туған күні (Жасы)</th>
                                <th>Категория / Нақты салмақ</th>
                                <th>Құжаттар</th>
                                <th>Допуск</th>
                                <th>Әрекеттер</th>
                            </tr>
                        </thead>
                        <tbody>
                           {application.athletes.map(athleteEntry => (
                               <AthleteRow 
                                   key={athleteEntry._id} 
                                   athleteEntry={athleteEntry} 
                                   application={application}
                                   onUpdate={handleAthleteUpdate}
                               />
                           ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminApplicationDetails;
