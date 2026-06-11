import api from './api';

export async function updateCurrentTenant(payload) {
  const { data } = await api.put('/tenants/current', payload);
  return data;
}
