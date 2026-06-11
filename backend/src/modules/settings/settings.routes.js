const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const settingsController = require('./settings.controller');
const { validateUpdateSettings } = require('./settings.validation');

const settingsRoutes = Router();

settingsRoutes.use('/settings', authenticate);

settingsRoutes.get('/settings', settingsController.getSettings);
settingsRoutes.put('/settings', requireWrite, validateUpdateSettings, settingsController.updateSettings);

module.exports = settingsRoutes;
