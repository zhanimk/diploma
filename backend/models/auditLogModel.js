const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'CREATE_TOURNAMENT', 'UPDATE_TOURNAMENT', 'DELETE_TOURNAMENT',
            'REGISTER_USER', 'BLOCK_USER', 'UNBLOCK_USER', 'UPDATE_USER_ROLE',
            'CREATE_CLUB', 'VERIFY_CLUB', 'DELETE_CLUB',
            'SUBMIT_APPLICATION', 'APPROVE_APPLICATION', 'REJECT_APPLICATION'
            // Add other actions as needed
        ]
    },
    description: {
        type: String,
        required: true
    },
    entity: {
        entityId: mongoose.Schema.Types.ObjectId,
        entityModel: String
    }
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
