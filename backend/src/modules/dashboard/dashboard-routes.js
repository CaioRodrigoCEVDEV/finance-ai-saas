const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');

const {
  getExpensesByCategory,
  getMonthlyFlow,
  getRecentTransactions,
  getSummary
} = require('./dashboard-controller');

const dashboardRoutes = Router();

dashboardRoutes.use('/dashboard', authenticate);

dashboardRoutes.get('/dashboard/summary', getSummary);
dashboardRoutes.get('/dashboard/expenses-by-category', getExpensesByCategory);
dashboardRoutes.get('/dashboard/recent-transactions', getRecentTransactions);
dashboardRoutes.get('/dashboard/monthly-flow', getMonthlyFlow);

module.exports = dashboardRoutes;
