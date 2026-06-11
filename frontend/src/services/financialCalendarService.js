import api from './api';

export async function getFinancialCalendarMonth({ year, month }) {
  const { data } = await api.get('/financial-calendar/month', {
    params: { year, month }
  });
  return data;
}
