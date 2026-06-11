import api from './api';

export async function listRecurrences(params = {}) {
  const { data } = await api.get('/recurrences', { params });
  return data;
}

export async function getRecurrence(id) {
  const { data } = await api.get(`/recurrences/${id}`);
  return data;
}

export async function createRecurrence(payload) {
  const { data } = await api.post('/recurrences', payload);
  return data;
}

export async function updateRecurrence(id, payload) {
  const { data } = await api.put(`/recurrences/${id}`, payload);
  return data;
}

export async function updateRecurrenceStatus(id, status) {
  const { data } = await api.patch(`/recurrences/${id}/status`, { status });
  return data;
}

export async function deleteRecurrence(id) {
  const { data } = await api.delete(`/recurrences/${id}`);
  return data;
}

export async function generateRecurrence(id) {
  const { data } = await api.post(`/recurrences/${id}/generate`);
  return data;
}
