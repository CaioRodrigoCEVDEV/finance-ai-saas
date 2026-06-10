const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const transactionsController = require('./transactions.controller');
const {
  validateCreateTransaction,
  validateUpdateTransaction,
  validateTransactionParams,
  validateListTransactionsQuery,
  validateMonthSummaryQuery
} = require('./transactions.validation');

const transactionsRoutes = Router();

transactionsRoutes.use('/transactions', authenticate);

transactionsRoutes.get('/transactions/summary/month', validateMonthSummaryQuery, transactionsController.getMonthSummary);
transactionsRoutes.get('/transactions', validateListTransactionsQuery, transactionsController.listTransactions);
transactionsRoutes.get('/transactions/:id', validateTransactionParams, transactionsController.getTransaction);
transactionsRoutes.post('/transactions', requireWrite, validateCreateTransaction, transactionsController.createTransaction);
transactionsRoutes.put('/transactions/:id', requireWrite, validateTransactionParams, validateUpdateTransaction, transactionsController.updateTransaction);
transactionsRoutes.delete('/transactions/:id', requireWrite, validateTransactionParams, transactionsController.deleteTransaction);

module.exports = transactionsRoutes;
