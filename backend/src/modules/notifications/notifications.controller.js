const notificationsService = require('./notifications.service');
const financialAlertService = require('./financial-alert.service');

async function listNotifications(request, response, next) {
  try {
    const data = await notificationsService.listNotifications(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getUnreadCount(request, response, next) {
  try {
    const data = await notificationsService.getUnreadCount(request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function markNotificationAsRead(request, response, next) {
  try {
    const data = await notificationsService.markAsRead(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function markAllAsRead(request, response, next) {
  try {
    const data = await notificationsService.markAllAsRead(request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function deleteNotification(request, response, next) {
  try {
    const data = await notificationsService.deleteNotification(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function generateAlerts(request, response, next) {
  try {
    const data = await financialAlertService.generateFinancialAlerts(request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  generateAlerts
};
