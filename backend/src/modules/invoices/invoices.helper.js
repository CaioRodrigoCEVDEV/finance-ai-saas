function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function safeDay(day, year, month) {
  const max = lastDayOfMonth(year, month);
  return Math.min(day, max);
}

function buildInvoicePeriod({ referenceMonth, referenceYear, closingDay, dueDay }) {
  const closingYear = referenceMonth === 12 ? referenceYear + 1 : referenceYear;
  const closingMonth = referenceMonth === 12 ? 0 : referenceMonth;

  const closingDaySafe = safeDay(closingDay, referenceYear, referenceMonth);
  const closingDate = new Date(referenceYear, referenceMonth - 1, closingDaySafe, 12, 0, 0);

  let dueYear = closingDate.getFullYear();
  let dueMonth = closingDate.getMonth();
  if (dueDay <= closingDay) {
    dueMonth += 1;
    if (dueMonth > 11) {
      dueMonth = 0;
      dueYear += 1;
    }
  }

  const dueDaySafe = safeDay(dueDay, dueYear, dueMonth + 1);
  const dueDate = new Date(dueYear, dueMonth, dueDaySafe, 12, 0, 0);

  let prevClosingYear = closingDate.getFullYear();
  let prevClosingMonth = closingDate.getMonth() - 1;
  if (prevClosingMonth < 0) {
    prevClosingMonth = 11;
    prevClosingYear -= 1;
  }
  const prevClosingDaySafe = safeDay(closingDay, prevClosingYear, prevClosingMonth + 1);
  const prevClosingDate = new Date(prevClosingYear, prevClosingMonth, prevClosingDaySafe, 12, 0, 0);
  const periodStart = new Date(prevClosingDate);
  periodStart.setDate(periodStart.getDate() + 1);
  periodStart.setHours(0, 0, 0, 0);

  const periodEnd = new Date(closingDate);
  periodEnd.setHours(23, 59, 59, 999);

  return {
    periodStart,
    periodEnd,
    closingDate,
    dueDate
  };
}

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
  safeDay,
  lastDayOfMonth
};
