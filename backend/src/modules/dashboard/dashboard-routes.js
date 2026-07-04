const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { validateDashboardQuery } = require('./dashboard.validation');

const {
  getExpensesByCategory,
  getMonthlyFlow,
  getRecentTransactions,
  getSummary,
  getOverview,
  getAlerts,
  getTopExpenses,
  getBudgetStatus,
  getGoalsProgress,
  getAvailablePeriods
} = require('./dashboard-controller');

const dashboardRoutes = Router();

dashboardRoutes.use('/dashboard', authenticate, validateDashboardQuery);

dashboardRoutes.get('/dashboard/summary', getSummary);
dashboardRoutes.get('/dashboard/expenses-by-category', getExpensesByCategory);
dashboardRoutes.get('/dashboard/recent-transactions', getRecentTransactions);
dashboardRoutes.get('/dashboard/monthly-flow', getMonthlyFlow);
dashboardRoutes.get('/dashboard/overview', getOverview);
dashboardRoutes.get('/dashboard/alerts', getAlerts);
dashboardRoutes.get('/dashboard/top-expenses', getTopExpenses);
dashboardRoutes.get('/dashboard/budget-status', getBudgetStatus);
dashboardRoutes.get('/dashboard/goals-progress', getGoalsProgress);
dashboardRoutes.get('/dashboard/available-periods', getAvailablePeriods);

module.exports = dashboardRoutes;
