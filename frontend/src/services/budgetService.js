import api from './api';

export async function getBudgets(params = {}) {
  const { data } = await api.get('/budgets', { params });
  return data;
}

export async function getBudget(id) {
  const { data } = await api.get(`/budgets/${id}`);
  return data;
}

export async function createBudget(payload) {
  const { data } = await api.post('/budgets', payload);
  return data;
}

export async function updateBudget(id, payload) {
  const { data } = await api.put(`/budgets/${id}`, payload);
  return data;
}

export async function deleteBudget(id) {
  const { data } = await api.delete(`/budgets/${id}`);
  return data;
}

export async function getBudgetMonthSummary(params = {}) {
  const { data } = await api.get('/budgets/summary/month', { params });
  return data;
}
