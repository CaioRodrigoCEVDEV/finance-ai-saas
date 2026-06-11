const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const controller = require('./notifications.controller');
const validation = require('./notifications.validation');

const notificationsRoutes = Router();

notificationsRoutes.use('/notifications', authenticate);

notificationsRoutes.get('/notifications', validation.validateListNotificationsQuery, controller.listNotifications);
notificationsRoutes.get('/notifications/unread-count', controller.getUnreadCount);
notificationsRoutes.post('/notifications/:id/read', validation.validateNotificationParams, controller.markNotificationAsRead);
notificationsRoutes.post('/notifications/read-all', controller.markAllAsRead);
notificationsRoutes.delete('/notifications/:id', validation.validateNotificationParams, controller.deleteNotification);
notificationsRoutes.post('/notifications/generate-alerts', requireWrite, controller.generateAlerts);

module.exports = notificationsRoutes;
