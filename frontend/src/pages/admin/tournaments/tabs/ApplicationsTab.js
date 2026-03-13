import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader, UserCheck, UserX, ShieldQuestion, CheckCircle, XCircle } from 'lucide-react';
import './ApplicationsTab.css';

const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return userInfo ? userInfo.token : null;
};

const ApplicationsTab = () => {
    const { id: tournamentId } = useParams();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) {
                toast.error('Сіз авторизациядан өтпегенсіз.');
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`/api/applications/tournament/${tournamentId}`, config);
            
            const athletesList = data.flatMap(app => 
                app.athletes.map(athleteEntry => ({
                    ...athleteEntry,
                    applicationId: app._id,
                    coach: app.coach,
                    status: app.status,
                }))
            );

            setApplications(athletesList);
        } catch (err) {
            setError('Өтінімдерді жүктеу мүмкін болмады.');
            toast.error(err.response?.data?.message || 'Жүктеу қатесі');
        } finally {
            setLoading(false);
        }
    }, [tournamentId]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const translateStatus = (status) => {
        switch (status) {
            case 'APPROVED': return 'Бекітілді';
            case 'REJECTED': return 'Қабылданбады';
            case 'PENDING': return 'Күтуде';
            default: return status;
        }
    };

    const handleUpdateStatus = async (applicationId, newStatus) => {
        setUpdatingStatus(applicationId);
        try {
            const token = getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`/api/applications/${applicationId}/status`, { status: newStatus }, config);

            setApplications(prevApplications =>
                prevApplications.map(app =>
                    app.applicationId === applicationId ? { ...app, status: newStatus } : app
                )
            );
            toast.success(`Өтінім мәртебесі жаңартылды: ${translateStatus(newStatus)}`);
        } catch (error) {
            toast.error('Мәртебені жаңарту мүмкін болмады.');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <UserCheck size={20} className="status-icon approved" />;
            case 'REJECTED': return <UserX size={20} className="status-icon rejected" />;
            case 'PENDING':
            default: return <ShieldQuestion size={20} className="status-icon pending" />;
        }
    };

    if (loading) {
        return <div className="loader-container"><Loader className="animate-spin" size={32} /> Өтінімдер жүктелуде...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    return (
        <div className="applications-tab-container">
            <div className="table-wrapper">
                <table className="content-table">
                    <thead>
                        <tr>
                            <th>Спортшы</th>
                            <th>Туған күні</th>
                            <th>Белбеу</th>
                            <th>Жаттықтырушы</th>
                            <th>Клуб</th>
                            <th>Мәртебесі</th>
                            <th style={{ textAlign: 'center' }}>Әрекеттер</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length > 0 ? (
                            applications.map(entry => (
                                <tr key={entry._id}>
                                    <td>{entry.athlete.firstName} {entry.athlete.lastName}</td>
                                    <td>{new Date(entry.athlete.dateOfBirth).toLocaleDateString()}</td>
                                    <td>{entry.athlete.belt || '-'}</td>
                                    <td>{entry.coach.firstName} {entry.coach.lastName}</td>
                                    <td>{entry.coach.club?.name || 'Көрсетілмеген'}</td>
                                    <td>
                                        <div className={`status-cell status-${entry.status.toLowerCase()}`}>
                                            {getStatusIcon(entry.status)}
                                            <span>{translateStatus(entry.status)}</span>
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        {updatingStatus === entry.applicationId ? (
                                            <Loader className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => handleUpdateStatus(entry.applicationId, 'APPROVED')} 
                                                    className="action-btn approve-btn" 
                                                    disabled={entry.status === 'APPROVED'}
                                                    title="Өтінімді бекіту"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateStatus(entry.applicationId, 'REJECTED')} 
                                                    className="action-btn reject-btn" 
                                                    disabled={entry.status === 'REJECTED'}
                                                    title="Өтінімді қабылдамау"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data-cell">Бұл турнирге әлі өтінімдер жоқ.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApplicationsTab;
