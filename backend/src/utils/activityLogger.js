const prisma = require('../prisma');

/**
 * Log an activity to the ActivityLog table.
 * Safe to call fire-and-forget — never throws.
 *
 * @param {Object} opts
 * @param {number|null}  opts.userId      - The user (staff) performing the action
 * @param {string}       opts.action      - e.g. "CREATE", "UPDATE", "DELETE"
 * @param {string}       opts.entity      - e.g. "Report", "Patient", "Invoice"
 * @param {string|number} opts.entityId   - The primary key / identifier of the entity
 * @param {string}       opts.description - Human-readable sentence about the change
 * @param {Object}       [opts.req]       - Express req object (used to extract IP)
 */
async function logActivity({ userId, action, entity, entityId, description, req }) {
  try {
    let ipAddress = null;
    if (req) {
      ipAddress =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        null;
    }

    await prisma.activityLog.create({
      data: {
        userId: userId ? Number(userId) : null,
        action: String(action),
        entity: entity ? String(entity) : null,
        entityId: entityId ? String(entityId) : null,
        description: description ? String(description) : null,
        ipAddress,
      },
    });
  } catch (err) {
    // Never crash the main request because of a log failure
    console.error('[ActivityLogger] Failed to write log:', err.message);
  }
}

module.exports = { logActivity };
