import api from './api';

export async function getDashboardSummary() {
  const { data } = await api.get('/dashboard/summary');
  return data;
}

export async function getExpensesByCategory() {
  const { data } = await api.get('/dashboard/expenses-by-category');
  return data;
}

export async function getRecentTransactions() {
  const { data } = await api.get('/dashboard/recent-transactions');
  return data;
}

export async function getMonthlyFlow() {
  const { data } = await api.get('/dashboard/monthly-flow');
  return data;
}

export async function getDashboardOverview() {
  const { data } = await api.get('/dashboard/overview');
  return data;
}

export async function getDashboardAlerts() {
  const { data } = await api.get('/dashboard/alerts');
  return data;
}

export async function getTopExpenses() {
  const { data } = await api.get('/dashboard/top-expenses');
  return data;
}

export async function getBudgetStatus() {
  const { data } = await api.get('/dashboard/budget-status');
  return data;
}

export async function getGoalsProgress() {
  const { data } = await api.get('/dashboard/goals-progress');
  return data;
}
