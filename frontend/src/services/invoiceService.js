import api from './api';

export async function listInvoices(params = {}) {
  const { data } = await api.get('/invoices', { params });
  return data;
}

export async function getCurrentInvoices() {
  const { data } = await api.get('/invoices/current');
  return data;
}

export async function getInvoice(id) {
  const { data } = await api.get(`/invoices/${id}`);
  return data;
}

export async function getInvoiceSummary() {
  const { data } = await api.get('/invoices/summary');
  return data;
}

export async function generateInvoice(payload) {
  const { data } = await api.post('/invoices/generate', payload);
  return data;
}

export async function recalculateInvoice(id) {
  const { data } = await api.post(`/invoices/${id}/recalculate`);
  return data;
}

export async function payInvoice(id, payload) {
  const { data } = await api.post(`/invoices/${id}/pay`, payload);
  return data;
}

export async function cancelInvoicePayment(id) {
  const { data } = await api.post(`/invoices/${id}/cancel-payment`);
  return data;
}
