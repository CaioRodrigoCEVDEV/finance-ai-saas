const { Router } = require('express');

const {
  getExpensesByCategory,
  getMonthlyFlow,
  getRecentTransactions,
  getSummary
} = require('./dashboard-controller');

const dashboardRoutes = Router();

dashboardRoutes.get('/dashboard/summary', getSummary);
dashboardRoutes.get('/dashboard/expenses-by-category', getExpensesByCategory);
dashboardRoutes.get('/dashboard/recent-transactions', getRecentTransactions);
dashboardRoutes.get('/dashboard/monthly-flow', getMonthlyFlow);

module.exports = dashboardRoutes;
