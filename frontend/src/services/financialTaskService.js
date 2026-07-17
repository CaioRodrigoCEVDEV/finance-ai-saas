import api from './api';

export async function getFinancialTasks(params = {}) {
  const { data } = await api.get('/financial-tasks', { params });
  return data;
}

export async function getFinancialTask(id) {
  const { data } = await api.get(`/financial-tasks/${id}`);
  return data;
}

export async function createFinancialTask(payload) {
  const { data } = await api.post('/financial-tasks', payload);
  return data;
}

export async function updateFinancialTask(id, payload) {
  const { data } = await api.put(`/financial-tasks/${id}`, payload);
  return data;
}

export async function completeFinancialTask(id) {
  const { data } = await api.patch(`/financial-tasks/${id}/complete`);
  return data;
}

export async function deleteFinancialTask(id) {
  const { data } = await api.delete(`/financial-tasks/${id}`);
  return data;
}

export async function getFinancialTaskDashboard() {
  const { data } = await api.get('/financial-tasks/dashboard');
  return data;
}
