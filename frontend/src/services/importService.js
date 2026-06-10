import api from './api';

export async function previewImport(formData) {
  const { data } = await api.post('/imports/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
}

export async function confirmImport(payload) {
  const { data } = await api.post('/imports/confirm', payload);
  return data;
}
