const AuditLog = require('../models/auditLogModel');

/**
 * Helper function to log an audit trail entry.
 * @param {string} userId - The ID of the user performing the action.
 * @param {string} action - The type of action performed (e.g., 'CREATE_TOURNAMENT').
 * @param {string} description - A human-readable description of the action.
 * @param {object} [entity] - Optional. The entity that was affected. { entityId, entityModel }.
 */
const logAction = async (userId, action, description, entity = null) => {
    try {
        await AuditLog.create({
            user: userId,
            action,
            description,
            entity: entity ? {
                entityId: entity.entityId,
                entityModel: entity.entityModel
            } : undefined
        });
    } catch (error) {
        console.error('Failed to log audit action:', error);
        // We don't throw an error here because logging should not
        // interrupt the primary action (e.g., creating a tournament).
    }
};

module.exports = { logAction };
