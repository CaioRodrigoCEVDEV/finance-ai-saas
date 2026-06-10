import api from './api';

export async function getTransactions(params = {}) {
  const { data } = await api.get('/transactions', { params });
  return data;
}

export async function getTransaction(id) {
  const { data } = await api.get(`/transactions/${id}`);
  return data;
}

export async function createTransaction(payload) {
  const { data } = await api.post('/transactions', payload);
  return data;
}

export async function updateTransaction(id, payload) {
  const { data } = await api.put(`/transactions/${id}`, payload);
  return data;
}

export async function deleteTransaction(id) {
  const { data } = await api.delete(`/transactions/${id}`);
  return data;
}

export async function getTransactionMonthSummary(params = {}) {
  const { data } = await api.get('/transactions/summary/month', { params });
  return data;
}
