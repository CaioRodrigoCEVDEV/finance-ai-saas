import api from './api';

export async function getAccounts() {
  const { data } = await api.get('/accounts');
  return data;
}

export async function getAccount(id) {
  const { data } = await api.get(`/accounts/${id}`);
  return data;
}

export async function createAccount(payload) {
  const { data } = await api.post('/accounts', payload);
  return data;
}

export async function updateAccount(id, payload) {
  const { data } = await api.put(`/accounts/${id}`, payload);
  return data;
}

export async function deleteAccount(id) {
  const { data } = await api.delete(`/accounts/${id}`);
  return data;
}
