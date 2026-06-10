import api from './api';

export async function getGoals(params = {}) {
  const { data } = await api.get('/goals', { params });
  return data;
}

export async function getGoal(id) {
  const { data } = await api.get(`/goals/${id}`);
  return data;
}

export async function createGoal(payload) {
  const { data } = await api.post('/goals', payload);
  return data;
}

export async function updateGoal(id, payload) {
  const { data } = await api.put(`/goals/${id}`, payload);
  return data;
}

export async function updateGoalProgress(id, payload) {
  const { data } = await api.patch(`/goals/${id}/progress`, payload);
  return data;
}

export async function deleteGoal(id) {
  const { data } = await api.delete(`/goals/${id}`);
  return data;
}

export async function getGoalSummary() {
  const { data } = await api.get('/goals/summary');
  return data;
}
