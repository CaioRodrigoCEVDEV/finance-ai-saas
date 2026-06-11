const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

function toNotificationResponse(notification) {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.is_read,
    referenceId: notification.reference_id,
    referenceType: notification.reference_type,
    metadata: notification.metadata,
    createdAt: notification.created_at.toISOString()
  };
}

async function createNotification(data, tenantId) {
  const notification = await prisma.notification.create({
    data: {
      tenant_id: tenantId,
      user_id: data.userId || null,
      title: data.title,
      message: data.message,
      type: data.type,
      reference_id: data.referenceId || null,
      reference_type: data.referenceType || null,
      metadata: data.metadata || null
    }
  });

  return toNotificationResponse(notification);
}

async function createNotificationIfNotExists(data, tenantId) {
  const where = {
    tenant_id: tenantId,
    type: data.type,
    is_read: false
  };

  if (data.referenceId) {
    where.reference_id = data.referenceId;
  }

  const existing = await prisma.notification.findFirst({ where });

  if (existing) {
    return null;
  }

  return createNotification(data, tenantId);
}

async function listNotifications(tenantId, filters = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where = {
    tenant_id: tenantId
  };

  if (typeof filters.isRead === 'boolean') {
    where.is_read = filters.isRead;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    }),
    prisma.notification.count({ where })
  ]);

  return {
    data: notifications.map(toNotificationResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function markAsRead(notificationId, tenantId) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      tenant_id: tenantId
    }
  });

  if (!notification) {
    throw new AppError('Notificacao nao encontrada', 404);
  }

  const updated = await prisma.notification.update({
    where: { id: notification.id },
    data: { is_read: true }
  });

  return toNotificationResponse(updated);
}

async function markAllAsRead(tenantId) {
  await prisma.notification.updateMany({
    where: {
      tenant_id: tenantId,
      is_read: false
    },
    data: { is_read: true }
  });

  return { message: 'Todas as notificacoes foram marcadas como lidas' };
}

async function getUnreadCount(tenantId) {
  const count = await prisma.notification.count({
    where: {
      tenant_id: tenantId,
      is_read: false
    }
  });

  return { count };
}

async function deleteNotification(notificationId, tenantId) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      tenant_id: tenantId
    }
  });

  if (!notification) {
    throw new AppError('Notificacao nao encontrada', 404);
  }

  await prisma.notification.delete({
    where: { id: notification.id }
  });

  return { message: 'Notificacao excluida com sucesso' };
}

module.exports = {
  createNotification,
  createNotificationIfNotExists,
  listNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification
};
