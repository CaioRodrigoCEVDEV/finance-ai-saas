import api from './api';

export async function getTransfers(params = {}) {
  const { data } = await api.get('/transfers', { params });
  return data;
}

export async function getTransfer(id) {
  const { data } = await api.get(`/transfers/${id}`);
  return data;
}

export async function createTransfer(payload) {
  const { data } = await api.post('/transfers', payload);
  return data;
}

export async function updateTransfer(id, payload) {
  const { data } = await api.put(`/transfers/${id}`, payload);
  return data;
}

export async function deleteTransfer(id) {
  const { data } = await api.delete(`/transfers/${id}`);
  return data;
}
