import api from './api';

export async function getProfile() {
  const { data } = await api.get('/profile');
  return data;
}

export async function updateProfile(payload) {
  const { data } = await api.put('/profile', payload);
  return data;
}

export async function updatePassword(payload) {
  const { data } = await api.put('/profile/password', payload);
  return data;
}
