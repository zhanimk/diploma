
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Check, X, Download, User, Weight, Cake } from 'lucide-react';
import './AdminApplicationDetails.css';

const AdminApplicationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchApplicationDetails = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/applications/${id}`);
            setApplication(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Өтінімді жүктеу кезінде қате.');
            navigate('/admin/applications');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchApplicationDetails();
    }, [fetchApplicationDetails]);

    const handleUpdateStatus = async (status) => {
        const actionText = status === 'APPROVED' ? 'қабылдағыңыз' : 'қабылдамағыңыз';
        if (window.confirm(`Сіз осы өтінімді ${actionText} келетініне сенімдісіз бе?`)) {
            setActionLoading(true);
            try {
                await axios.put(`/api/applications/${id}/status`, { status });
                toast.success(`Өтінім сәтті ${status === 'APPROVED' ? 'қабылданды' : 'қабылданбады'}!`);
                fetchApplicationDetails();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Статусты жаңарту кезінде қате.');
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleVerifyAthlete = async (athleteEntryId, isVerified) => {
        try {
            // Optimistic UI update
            setApplication(prev => ({
                ...prev,
                athletes: prev.athletes.map(ae => 
                    ae._id === athleteEntryId ? { ...ae, isVerifiedByAdmin: isVerified } : ae
                )
            }));

            await axios.put(`/api/applications/verify-athlete`, { 
                applicationId: id, 
                athleteEntryId,
                isVerified 
            });
            toast.success(`Спортшы статусы жаңартылды`);

        } catch (error) {
             toast.error(error.response?.data?.message || 'Спортшыны верификациялау кезінде қате.');
            // Revert UI on error
            fetchApplicationDetails();
        }
    }

    const getDocumentLink = (docs, type) => {
        if (!docs) return null;
        const doc = docs.find(d => d.docType === type);
        return doc ? doc.url : null;
    }

    if (loading) {
        return <div className="loading-indicator">Жүктелуде...</div>;
    }

    if (!application) {
        return <div className="loading-indicator">Өтінім табылмады.</div>;
    }

    return (
        <div className="application-details-container admin-container">
            <Link to="/admin/applications" className="btn-back">
                <ArrowLeft size={20} />
                <span>Барлық өтінімдерге оралу</span>
            </Link>

            <header className="details-header">
                <h1>Өтінім: {application.tournament?.name}</h1>
                <div className="header-actions">
                     <button 
                        className="btn-action btn-reject" 
                        onClick={() => handleUpdateStatus('REJECTED')}
                        disabled={actionLoading || application.status !== 'PENDING'}
                    >
                        <X size={18} />
                        <span>Қабылдамау</span>
                    </button>
                    <button 
                        className="btn-action btn-approve" 
                        onClick={() => handleUpdateStatus('APPROVED')}
                        disabled={actionLoading || application.status !== 'PENDING'}
                    >
                        <Check size={18} />
                        <span>Қабылдау</span>
                    </button>
                </div>
            </header>

            <div className="details-grid">
                 <div className="detail-card">
                    <h4>Турнир</h4>
                    <p>{application.tournament?.name}</p>
                    <span>{new Date(application.tournament?.date).toLocaleDateString()}</span>
                </div>
                 <div className="detail-card">
                    <h4>Тренер</h4>
                    <p>{`${application.coach?.user?.firstName} ${application.coach?.user?.lastName}`}</p>
                    <span>{application.coach?.user?.email}</span>
                </div>
                <div className="detail-card">
                    <h4>Команда</h4>
                    <p>{application.coach?.teamName}</p>
                </div>
                 <div className="detail-card">
                    <h4>Статус</h4>
                    <p className={`status-text status-${application.status?.toLowerCase()}`}>{application.status}</p>
                </div>
            </div>

            <section className="athletes-section">
                <h2><User size={24}/> Тіркелген спортшылар ({application.athletes?.length || 0})</h2>
                <div className="athletes-table-container">
                    <table className="athletes-table">
                        <thead>
                            <tr>
                                <th>Аты-жөні</th>
                                <th>Туған күні (Жасы)</th>
                                <th>Салмақ категориясы</th>
                                <th>Құжаттар</th>
                                <th>Верификация</th>
                            </tr>
                        </thead>
                        <tbody>
                            {application.athletes.map(athleteEntry => {
                                const medLink = getDocumentLink(athleteEntry.documents, 'MEDICAL_CERTIFICATE');
                                const insLink = getDocumentLink(athleteEntry.documents, 'INSURANCE');

                                return (
                                <tr key={athleteEntry._id}>
                                    <td><User size={16}/> {`${athleteEntry.athlete?.user?.firstName} ${athleteEntry.athlete?.user?.lastName}`}</td>
                                    <td><Cake size={16}/> {new Date(athleteEntry.athlete?.dateOfBirth).toLocaleDateString()} ({athleteEntry.ageCategory?.name})</td>
                                    <td><Weight size={16}/> {athleteEntry.weightCategory?.weight} кг</td>
                                    <td className="documents-cell">
                                        {medLink ? (
                                            <a href={medLink} target="_blank" rel="noopener noreferrer" className="document-link">
                                                <Download size={16}/> Мед. анықтама
                                            </a>
                                        ) : <span className="document-missing">Жоқ</span>}
                                        {insLink ? (
                                            <a href={insLink} target="_blank" rel="noopener noreferrer" className="document-link">
                                                <Download size={16}/> Сақтандыру
                                            </a>
                                        ) : <span className="document-missing">Жоқ</span>}
                                    </td>
                                    <td className="verification-cell">
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={athleteEntry.isVerifiedByAdmin || false}
                                                onChange={(e) => handleVerifyAthlete(athleteEntry._id, e.target.checked)}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </td>
                                </tr>
                            )})
                        }
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminApplicationDetails;
