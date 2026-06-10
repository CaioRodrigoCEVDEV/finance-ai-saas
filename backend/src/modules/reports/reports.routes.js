const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const {
  getFinancialSummary,
  getReportByCategory,
  getReportByAccount,
  getReportByCreditCard,
  getMonthlyEvolution,
  getTopExpenses,
  exportCsv
} = require('./reports.controller');

const reportsRoutes = Router();

reportsRoutes.use('/reports', authenticate);

reportsRoutes.get('/reports/financial-summary', getFinancialSummary);
reportsRoutes.get('/reports/by-category', getReportByCategory);
reportsRoutes.get('/reports/by-account', getReportByAccount);
reportsRoutes.get('/reports/by-credit-card', getReportByCreditCard);
reportsRoutes.get('/reports/monthly-evolution', getMonthlyEvolution);
reportsRoutes.get('/reports/top-expenses', getTopExpenses);
reportsRoutes.get('/reports/export.csv', exportCsv);

module.exports = reportsRoutes;
