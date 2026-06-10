const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const accountsController = require('./accounts.controller');
const {
  validateCreateAccount,
  validateUpdateAccount,
  validateAccountParams
} = require('./accounts.validation');

const accountsRoutes = Router();

accountsRoutes.use('/accounts', authenticate);

accountsRoutes.get('/accounts', accountsController.listAccounts);
accountsRoutes.get('/accounts/:id', validateAccountParams, accountsController.getAccount);
accountsRoutes.post('/accounts', validateCreateAccount, accountsController.createAccount);
accountsRoutes.put('/accounts/:id', validateAccountParams, validateUpdateAccount, accountsController.updateAccount);
accountsRoutes.delete('/accounts/:id', validateAccountParams, accountsController.deleteAccount);

module.exports = accountsRoutes;
