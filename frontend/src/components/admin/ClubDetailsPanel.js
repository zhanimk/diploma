import React from 'react';
import './Panel.css'; // Reusing the same panel styles
import { X, Home, User, MapPin, Calendar, CheckCircle, Trash, Users } from 'lucide-react';

const ClubDetailsPanel = ({ club, onClose, onVerify, onDelete }) => {
    if (!club) return null;

    return (
        <div className="panel-overlay" onClick={onClose}>
            <div className="panel-container" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>Клуб Ақпараты</h2>
                    <button onClick={onClose} className="panel-close-btn"><X size={24} /></button>
                </div>
                <div className="panel-body">
                    <div className="panel-section text-center">
                        {/* <div className="avatar-large"><Home size={36}/></div> */}
                        <h3>{club.name}</h3>
                        <p className={`status-badge status-${club.isVerified ? 'verified' : 'pending'}`}>
                            {club.isVerified ? 'Расталған' : 'Тексеруді күтуде'}
                        </p>
                    </div>

                    <div className="panel-section">
                        <h4>Негізгі ақпарат</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <User size={16} />
                                <div>
                                    <span>Жаттықтырушы</span>
                                    <p>{club.coachName}</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <MapPin size={16} />
                                <div>
                                    <span>Аймақ</span>
                                    <p>{club.region}</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <Calendar size={16} />
                                <div>
                                    <span>Құрылған күні</span>
                                    <p>{new Date(club.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panel-section">
                        <h4><Users size={14} style={{ marginRight: '8px' }}/> Қатысушылар ({club.members?.length || 0})</h4>
                        {club.members && club.members.length > 0 ? (
                            <ul className="panel-list">
                                {club.members.map(member => (
                                    <li key={member._id} className="panel-list-item">
                                        <div className="avatar-small">{member.firstName?.charAt(0)}</div>
                                        <div>
                                            <p>{member.firstName} {member.lastName}</p>
                                            <span className='role-badge role-athlete'>Спортшы</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Бұл клубта тіркелген қатысушылар жоқ.</p>
                        )}
                    </div>

                </div>
                <div className="panel-footer">
                    {!club.isVerified && (
                         <button className="btn btn-primary" onClick={() => onVerify(club._id)}>
                            <CheckCircle size={16}/> Растау
                        </button>
                    )}
                    <button className="btn btn-danger" onClick={() => onDelete(club._id)}>
                        <Trash size={16}/> Жою
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClubDetailsPanel;
