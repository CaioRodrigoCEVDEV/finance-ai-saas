const prisma = require('../config/prisma');

async function createAuditLog(action, entity, entityId, metadata, request) {
  return createAuditLogEntry({
    tenantId: request.tenant?.id || null,
    userId: request.user?.id || null,
    action,
    entity,
    entityId,
    metadata,
    ipAddress: request.ip || null,
    userAgent: request.get('user-agent') || null
  });
}

async function createAuditLogEntry({ tenantId = null, userId = null, action, entity, entityId = null, metadata = null, ipAddress = null, userAgent = null }) {
  try {
    await prisma.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        action,
        entity,
        entity_id: entityId || null,
        metadata: metadata || null,
        ip_address: ipAddress,
        user_agent: userAgent
      }
    });
  } catch {
    // audit log failure should never break the request
  }
}

function auditLog(action, entity, getMetadata) {
  return async function auditLogMiddleware(request, _response, next) {
    const entityId = request.params?.id || null;

    let metadata = null;
    if (typeof getMetadata === 'function') {
      try {
        metadata = getMetadata(request);
      } catch {
        metadata = null;
      }
    }

    await createAuditLog(action, entity, entityId, metadata, request);

    return next();
  };
}

module.exports = {
  createAuditLog,
  createAuditLogEntry,
  auditLog
};
