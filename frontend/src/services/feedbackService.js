import api from './api';

export async function createFeedback(payload) {
  const { data } = await api.post('/feedbacks', payload);
  return data;
}
