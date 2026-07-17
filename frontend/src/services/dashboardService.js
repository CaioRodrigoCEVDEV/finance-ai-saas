import api from './api';

function buildPeriodParams(period) {
  const params = {};

  if (Number.isInteger(period?.month)) {
    params.month = period.month;
  }

  if (Number.isInteger(period?.year)) {
    params.year = period.year;
  }

  return Object.keys(params).length > 0 ? { params } : undefined;
}

export async function getDashboardSummary(period) {
  const { data } = await api.get('/dashboard/summary', buildPeriodParams(period));
  return data;
}

export async function getExpensesByCategory(period) {
  const { data } = await api.get('/dashboard/expenses-by-category', buildPeriodParams(period));
  return data;
}

export async function getRecentTransactions(period) {
  const { data } = await api.get('/dashboard/recent-transactions', buildPeriodParams(period));
  return data;
}

export async function getMonthlyFlow(period) {
  const { data } = await api.get('/dashboard/monthly-flow', buildPeriodParams(period));
  return data;
}

export async function getDashboardOverview(period) {
  const { data } = await api.get('/dashboard/overview', buildPeriodParams(period));
  return data;
}

export async function getTopExpenses(period) {
  const { data } = await api.get('/dashboard/top-expenses', buildPeriodParams(period));
  return data;
}

export async function getBudgetStatus(period) {
  const { data } = await api.get('/dashboard/budget-status', buildPeriodParams(period));
  return data;
}

export async function getGoalsProgress(period) {
  const { data } = await api.get('/dashboard/goals-progress', buildPeriodParams(period));
  return data;
}

export async function getAvailablePeriods() {
  const { data } = await api.get('/dashboard/available-periods');
  return data;
}
