import api from './api';

export async function listInvites() {
  const { data } = await api.get('/invites');
  return data;
}

export async function createInvite(payload) {
  const { data } = await api.post('/invites', payload);
  return data;
}

export async function updateInviteStatus(id, status) {
  const { data } = await api.patch(`/invites/${id}/status`, { status });
  return data;
}

export async function deleteInvite(id) {
  const { data } = await api.delete(`/invites/${id}`);
  return data;
}

export async function trackInvite(code) {
  const { data } = await api.post(`/invites/track/${code}`);
  return data;
}
