import React from 'react';
import './ConfirmationModal.css';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmVariant = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <AlertTriangle className={`modal-icon ${confirmVariant}`} />
                    <h3>{title}</h3>
                    <button onClick={onClose} className="close-button">
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">
                        Болдырмау
                    </button>
                    <button onClick={onConfirm} className={`btn btn-${confirmVariant}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
