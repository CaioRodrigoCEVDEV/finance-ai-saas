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
