import React from 'react';
import './Panel.css'; // Общий стиль для панелей
import { X, User, Mail, Shield, Calendar, Lock, Unlock } from 'lucide-react';

const UserDetailsPanel = ({ user, onClose, onBlock, onEditRole }) => {
    if (!user) return null;

    return (
        <div className="panel-overlay" onClick={onClose}>
            <div className="panel-container" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>Ақпарат</h2>
                    <button onClick={onClose} className="panel-close-btn"><X size={24} /></button>
                </div>
                <div className="panel-body">
                    <div className="panel-section text-center">
                        <div className="avatar-large">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</div>
                        <h3>{user.firstName} {user.lastName}</h3>
                        <p className={`role-badge role-${user.role}`}>{user.role}</p>
                    </div>

                    <div className="panel-section">
                        <h4>Байланыс ақпараты</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <Mail size={16} />
                                <div>
                                    <span>Email</span>
                                    <p>{user.email}</p>
                                </div>
                            </div>
                             <div className="info-item">
                                <Calendar size={16} />
                                <div>
                                    <span>Тіркелген күні</span>
                                    <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {user.club && (
                         <div className="panel-section">
                            <h4>Клуб</h4>
                             <div className="info-grid">
                                <div className="info-item">
                                    <Shield size={16} />
                                    <div>
                                        <span>Атауы</span>
                                        <p>{user.club.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
                <div className="panel-footer">
                    <button className="btn btn-secondary" onClick={() => onEditRole(user)}>Рөлді өзгерту</button>
                    <button 
                        className={`btn btn-${user.isBlocked ? 'primary' : 'danger'}`}
                        onClick={() => onBlock(user._id, user.isBlocked)}
                    >
                        {user.isBlocked ? <Unlock size={16}/> : <Lock size={16} />} 
                        {user.isBlocked ? 'Бұғаттан шығару' : 'Бұғаттау'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsPanel;
