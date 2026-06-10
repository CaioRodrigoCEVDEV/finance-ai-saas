import api from './api';

export async function getCreditCards() {
  const { data } = await api.get('/credit-cards');
  return data;
}

export async function getCreditCard(id) {
  const { data } = await api.get(`/credit-cards/${id}`);
  return data;
}

export async function createCreditCard(payload) {
  const { data } = await api.post('/credit-cards', payload);
  return data;
}

export async function updateCreditCard(id, payload) {
  const { data } = await api.put(`/credit-cards/${id}`, payload);
  return data;
}

export async function deleteCreditCard(id) {
  const { data } = await api.delete(`/credit-cards/${id}`);
  return data;
}
