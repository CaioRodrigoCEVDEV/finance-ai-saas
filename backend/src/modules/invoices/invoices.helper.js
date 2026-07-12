const {
  buildInvoicePeriod,
  calculateInvoiceAmount,
  lastDayOfMonth,
  safeDay
} = require('../../utils/credit-card-invoice');

function computeEffectiveStatus(invoice) {
  if (invoice.status === 'PAID') return 'PAID';

  const now = new Date();
  const dueDate = new Date(invoice.dueDate);
  const closingDate = new Date(invoice.closingDate);

  if (now > dueDate) return 'OVERDUE';
  if (now > closingDate) return 'CLOSED';
  return 'OPEN';
}

function formatMonthYear(month, year) {
  const names = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${names[month - 1]}/${year}`;
}

module.exports = {
  buildInvoicePeriod,
  computeEffectiveStatus,
  formatMonthYear,
  calculateInvoiceAmount,
  safeDay,
  lastDayOfMonth
};
