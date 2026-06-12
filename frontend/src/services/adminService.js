import api from './api';

export async function getAdminDashboard() {
  const { data } = await api.get('/admin/dashboard');
  return data;
}

export async function listTenants(params) {
  const { data } = await api.get('/admin/tenants', { params });
  return data;
}

export async function getTenant(id) {
  const { data } = await api.get(`/admin/tenants/${id}`);
  return data;
}

export async function updateTenant(id, payload) {
  const { data } = await api.patch(`/admin/tenants/${id}`, payload);
  return data;
}

export async function suspendTenant(id) {
  const { data } = await api.post(`/admin/tenants/${id}/suspend`);
  return data;
}

export async function reactivateTenant(id) {
  const { data } = await api.post(`/admin/tenants/${id}/reactivate`);
  return data;
}

export async function listUsers(params) {
  const { data } = await api.get('/admin/users', { params });
  return data;
}

export async function getUser(id) {
  const { data } = await api.get(`/admin/users/${id}`);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await api.patch(`/admin/users/${id}`, payload);
  return data;
}

export async function blockUser(id) {
  const { data } = await api.post(`/admin/users/${id}/block`);
  return data;
}

export async function unblockUser(id) {
  const { data } = await api.post(`/admin/users/${id}/unblock`);
  return data;
}

export async function resetUserPassword(id, password) {
  const { data } = await api.post(`/admin/users/${id}/reset-password`, { password });
  return data;
}

export async function listPlanLimits() {
  const { data } = await api.get('/admin/plans');
  return data;
}

export async function getPlanLimit(plan) {
  const { data } = await api.get(`/admin/plans/${plan}`);
  return data;
}

export async function updatePlanLimit(plan, payload) {
  const { data } = await api.patch(`/admin/plans/${plan}`, payload);
  return data;
}

export async function listFeedbacks(params) {
  const { data } = await api.get('/admin/feedbacks', { params });
  return data;
}

export async function getFeedback(id) {
  const { data } = await api.get(`/admin/feedbacks/${id}`);
  return data;
}

export async function updateFeedbackStatus(id, status) {
  const { data } = await api.patch(`/admin/feedbacks/${id}`, { status });
  return data;
}

export async function listAuditLogs(params) {
  const { data } = await api.get('/admin/audit-logs', { params });
  return data;
}

export async function getPaymentSettings() {
  const { data } = await api.get('/admin/payment-settings');
  return data;
}

export async function updateStripeSettings(payload) {
  const { data } = await api.patch('/admin/payment-settings/stripe', payload);
  return data;
}

export async function updateMercadoPagoSettings(payload) {
  const { data } = await api.patch('/admin/payment-settings/mercado-pago', payload);
  return data;
}

export async function testStripeSettings() {
  const { data } = await api.post('/admin/payment-settings/stripe/test');
  return data;
}

export async function testMercadoPagoSettings() {
  const { data } = await api.post('/admin/payment-settings/mercado-pago/test');
  return data;
}

export async function updateBillingPlans(payload) {
  const { data } = await api.patch('/admin/payment-settings/plans', payload);
  return data;
}

export async function listPaymentEvents(params) {
  const { data } = await api.get('/admin/payment-events', { params });
  return data;
}
