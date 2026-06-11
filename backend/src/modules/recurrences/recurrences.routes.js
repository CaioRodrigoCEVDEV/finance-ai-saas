const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const recurrencesController = require('./recurrences.controller');
const {
  validateCreateRecurrence,
  validateUpdateRecurrence,
  validateUpdateStatus,
  validateRecurrenceParams,
  validateListRecurrencesQuery
} = require('./recurrences.validation');

const recurrencesRoutes = Router();

recurrencesRoutes.use('/recurrences', authenticate);

recurrencesRoutes.get('/recurrences', validateListRecurrencesQuery, recurrencesController.listRecurrences);
recurrencesRoutes.get('/recurrences/:id', validateRecurrenceParams, recurrencesController.getRecurrence);
recurrencesRoutes.post('/recurrences', requireWrite, validateCreateRecurrence, recurrencesController.createRecurrence);
recurrencesRoutes.put('/recurrences/:id', requireWrite, validateRecurrenceParams, validateUpdateRecurrence, recurrencesController.updateRecurrence);
recurrencesRoutes.patch('/recurrences/:id/status', requireWrite, validateRecurrenceParams, validateUpdateStatus, recurrencesController.updateRecurrenceStatus);
recurrencesRoutes.delete('/recurrences/:id', requireWrite, validateRecurrenceParams, recurrencesController.deleteRecurrence);
recurrencesRoutes.post('/recurrences/:id/generate', requireWrite, validateRecurrenceParams, recurrencesController.generateTransaction);

module.exports = recurrencesRoutes;
