import api from './api';

export async function getBillingCurrent() {
  const { data } = await api.get('/billing/current');
  return data;
}

export async function getBillingPlans() {
  const { data } = await api.get('/billing/plans');
  return data;
}

export async function createBillingCheckout(payload) {
  const { data } = await api.post('/billing/checkout', payload);
  return data;
}

export async function createCustomerPortal() {
  const { data } = await api.post('/billing/customer-portal');
  return data;
}
