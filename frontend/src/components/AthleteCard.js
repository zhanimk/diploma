
import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Home, Edit, Trash2, Save, X } from 'lucide-react';
import '../pages/athlete/Dashboard.css'; // Используем те же стили

const ProfileField = ({ icon, label, value, defaultValue = 'Көрсетілмеген' }) => (
    <div className="profile-field compact">
        {icon && <div className="profile-field__icon">{icon}</div>}
        <div className="profile-field__body">
            <span className="profile-field__label">{label}</span>
            <span className="profile-field__value">{value || defaultValue}</span>
        </div>
    </div>
);

const AthleteCard = ({ athlete, onUpdate, onRemove }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: athlete.firstName || '',
        lastName: athlete.lastName || '',
        phoneNumber: athlete.phoneNumber || '',
        dateOfBirth: athlete.dateOfBirth ? new Date(athlete.dateOfBirth).toISOString().split('T')[0] : '',
        club: athlete.club || '',
        city: athlete.city || ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onUpdate(athlete._id, formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            firstName: athlete.firstName || '',
            lastName: athlete.lastName || '',
            phoneNumber: athlete.phoneNumber || '',
            dateOfBirth: athlete.dateOfBirth ? new Date(athlete.dateOfBirth).toISOString().split('T')[0] : '',
            club: athlete.club || '',
            city: athlete.city || ''
        });
    };

    return (
        <div className="card athlete-card-details">
            {/* --- ПЕРЕВОД ЗАГОЛОВКА И КНОПОК --- */}
            <div className="card-header">
                <h3>{athlete.firstName} {athlete.lastName}</h3>
                <div className="card-header-actions">
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="action-btn success-btn" title="Сақтау"><Save size={18} /></button>
                            <button onClick={handleCancel} className="action-btn cancel-btn" title="Болдырмау"><X size={18} /></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="action-btn" title="Өңдеу"><Edit size={18} /></button>
                            <button onClick={() => onRemove(athlete._id)} className="action-btn danger-btn" title="Өшіру"><Trash2 size={18} /></button>
                        </>
                    )}
                </div>
            </div>

            {isEditing ? (
                 /* --- ПЕРЕВОД ФОРМЫ РЕДАКТИРОВАНИЯ --- */
                <div className="profile-edit-form compact">
                    <div className="form-grid compact">
                        <div className="form-group"><label>Аты:</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Тегі:</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Телефон:</label><input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Туған күні:</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Қала:</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Клуб:</label><input type="text" name="club" value={formData.club} onChange={handleInputChange} /></div>
                    </div>
                </div>
            ) : (
                /* --- ПЕРЕВОД ПОЛЕЙ ПРОФИЛЯ --- */
                <div className="profile-fields-grid compact">
                    <ProfileField icon={<Mail size={18} />} label="Email" value={athlete.email} />
                    <ProfileField icon={<Phone size={18} />} label="Телефон" value={athlete.phoneNumber} />
                    <ProfileField icon={<Calendar size={18} />} label="Туған күні" value={athlete.dateOfBirth ? new Date(athlete.dateOfBirth).toLocaleDateString() : null} />
                    <ProfileField icon={<MapPin size={18} />} label="Қала" value={athlete.city} />
                    <ProfileField icon={<Home size={18} />} label="Клуб" value={athlete.club} />
                </div>
            )}
        </div>
    );
};

export default AthleteCard;
