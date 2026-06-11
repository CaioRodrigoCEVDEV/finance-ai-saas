import api from './api';

export async function getNotifications(params) {
  const { data } = await api.get('/notifications', { params });
  return data;
}

export async function getUnreadCount() {
  const { data } = await api.get('/notifications/unread-count');
  return data;
}

export async function markAsRead(id) {
  const { data } = await api.post(`/notifications/${id}/read`);
  return data;
}

export async function markAllAsRead() {
  const { data } = await api.post('/notifications/read-all');
  return data;
}

export async function deleteNotification(id) {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
}

export async function generateAlerts() {
  const { data } = await api.post('/notifications/generate-alerts');
  return data;
}
