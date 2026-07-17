const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const transfersController = require('./transfers.controller');
const {
  validateCreateTransfer,
  validateUpdateTransfer,
  validateTransferParams,
  validateListTransfersQuery
} = require('./transfers.validation');

const transfersRoutes = Router();

transfersRoutes.use('/transfers', authenticate);

transfersRoutes.get('/transfers', validateListTransfersQuery, transfersController.listTransfers);
transfersRoutes.get('/transfers/:id', validateTransferParams, transfersController.getTransfer);
transfersRoutes.post('/transfers', requireWrite, validateCreateTransfer, transfersController.createTransfer);
transfersRoutes.put('/transfers/:id', requireWrite, validateTransferParams, validateUpdateTransfer, transfersController.updateTransfer);
transfersRoutes.delete('/transfers/:id', requireWrite, validateTransferParams, transfersController.deleteTransfer);

module.exports = transfersRoutes;
