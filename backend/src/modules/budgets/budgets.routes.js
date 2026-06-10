const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const budgetsController = require('./budgets.controller');
const {
  validateCreateBudget,
  validateUpdateBudget,
  validateBudgetParams,
  validateListBudgetsQuery,
  validateBudgetMonthSummaryQuery
} = require('./budgets.validation');

const budgetsRoutes = Router();

budgetsRoutes.use('/budgets', authenticate);

budgetsRoutes.get('/budgets/summary/month', validateBudgetMonthSummaryQuery, budgetsController.getMonthSummary);
budgetsRoutes.get('/budgets', validateListBudgetsQuery, budgetsController.listBudgets);
budgetsRoutes.get('/budgets/:id', validateBudgetParams, budgetsController.getBudget);
budgetsRoutes.post('/budgets', validateCreateBudget, budgetsController.createBudget);
budgetsRoutes.put('/budgets/:id', validateBudgetParams, validateUpdateBudget, budgetsController.updateBudget);
budgetsRoutes.delete('/budgets/:id', validateBudgetParams, budgetsController.deleteBudget);

module.exports = budgetsRoutes;
