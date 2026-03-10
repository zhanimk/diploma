import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Calendar, MapPin, Weight, Shield, Edit } from 'lucide-react';

const InfoField = ({ icon, label, value }) => (
    <div className="athlete-info-field">
        <div className="athlete-info-field__icon">{icon}</div>
        <div className="athlete-info-field__content">
            <span className="athlete-info-field__label">{label}</span>
            <span className="athlete-info-field__value">{value || 'Көрсетілмеген'}</span>
        </div>
    </div>
);

const AthleteCard = ({ athlete }) => (
    <div className="athlete-card">
        <div className="athlete-card__header">
            <div className="athlete-card__avatar">{athlete.firstName.charAt(0)}{athlete.lastName.charAt(0)}</div>
            <div className="athlete-card__identity">
                <h3 className="athlete-card__name">{athlete.firstName} {athlete.lastName}</h3>
                <span className="athlete-card__email"><Mail size={14}/> {athlete.email}</span>
            </div>
            <Link to={`/coach/edit-athlete/${athlete._id}`} className="btn-icon btn-edit">
                <Edit size={18} />
            </Link>
        </div>
        <div className="athlete-card__body">
            <InfoField 
                icon={<Calendar size={18} />}
                label="Туған күні" 
                value={athlete.dateOfBirth ? new Date(athlete.dateOfBirth).toLocaleDateString() : 'Көрсетілмеген'}
            />
            <InfoField icon={<Weight size={18} />} label="Салмақ" value={athlete.weight ? `${athlete.weight} кг` : 'Көрсетілмеген'} />
            <InfoField icon={<MapPin size={18} />} label="Қала" value={athlete.city} />
            <InfoField icon={<Shield size={18} />} label="Дәреже" value={athlete.rank} />
        </div>
    </div>
);

export default AthleteCard;