import api from './api';

export async function getCategorizationRules(params = {}) {
  const { data } = await api.get('/categorization-rules', { params });
  return data;
}

export async function getCategorizationRule(id) {
  const { data } = await api.get(`/categorization-rules/${id}`);
  return data;
}

export async function createCategorizationRule(payload) {
  const { data } = await api.post('/categorization-rules', payload);
  return data;
}

export async function updateCategorizationRule(id, payload) {
  const { data } = await api.put(`/categorization-rules/${id}`, payload);
  return data;
}

export async function deleteCategorizationRule(id) {
  const { data } = await api.delete(`/categorization-rules/${id}`);
  return data;
}

export async function testCategorizationRule(description) {
  const { data } = await api.post('/categorization-rules/test', { description });
  return data;
}

export async function applyCategorizationRules(payload) {
  const { data } = await api.post('/categorization-rules/apply', payload);
  return data;
}
