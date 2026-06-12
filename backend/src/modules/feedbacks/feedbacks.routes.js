const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireOwnerOrAdmin } = require('../../middlewares/authorize');
const controller = require('./feedbacks.controller');
const validation = require('./feedbacks.validation');

const feedbacksRoutes = Router();

feedbacksRoutes.use('/feedbacks', authenticate);

feedbacksRoutes.post('/feedbacks', validation.validateCreateFeedback, controller.createFeedback);
feedbacksRoutes.get('/feedbacks', requireOwnerOrAdmin, controller.listFeedbacks);
feedbacksRoutes.get('/feedbacks/:id', requireOwnerOrAdmin, validation.validateFeedbackParams, controller.getFeedback);
feedbacksRoutes.patch('/feedbacks/:id/status', requireOwnerOrAdmin, validation.validateFeedbackParams, validation.validateUpdateFeedbackStatus, controller.updateFeedbackStatus);

module.exports = feedbacksRoutes;
