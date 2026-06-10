const prisma = require('../config/prisma');

async function createAuditLog(action, entity, entityId, metadata, request) {
  try {
    await prisma.auditLog.create({
      data: {
        tenant_id: request.tenant?.id || null,
        user_id: request.user?.id || null,
        action,
        entity,
        entity_id: entityId || null,
        metadata: metadata || null,
        ip_address: request.ip || null,
        user_agent: request.get('user-agent') || null
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
  auditLog
};
