import api from './api';

export async function getFinancialSummary(params = {}) {
  const { data } = await api.get('/reports/financial-summary', { params });
  return data;
}

export async function getReportByCategory(params = {}) {
  const { data } = await api.get('/reports/by-category', { params });
  return data;
}

export async function getReportByAccount(params = {}) {
  const { data } = await api.get('/reports/by-account', { params });
  return data;
}

export async function getReportByCreditCard(params = {}) {
  const { data } = await api.get('/reports/by-credit-card', { params });
  return data;
}

export async function getMonthlyEvolution(params = {}) {
  const { data } = await api.get('/reports/monthly-evolution', { params });
  return data;
}

export async function getTopExpenses(params = {}) {
  const { data } = await api.get('/reports/top-expenses', { params });
  return data;
}

export async function exportTransactionsCsv(params = {}) {
  const response = await api.get('/reports/export.csv', {
    params,
    responseType: 'blob'
  });

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'transacoes.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return response;
}
