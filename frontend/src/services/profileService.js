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

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.put('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function removeAvatar() {
  const { data } = await api.delete('/profile/avatar');
  return data;
}
