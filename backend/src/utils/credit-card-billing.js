function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function safeDay(day, year, month) {
  return Math.min(day, lastDayOfMonth(year, month));
}

function calculateCreditCardBillingPeriod(closingDay, referenceDate) {
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1;
  const refDay = referenceDate.getDate();

  const closingInRefMonth = safeDay(closingDay, refYear, refMonth);

  if (refDay <= closingInRefMonth) {
    const prevMonth = refMonth === 1 ? 12 : refMonth - 1;
    const prevYear = refMonth === 1 ? refYear - 1 : refYear;
    const closingPrev = safeDay(closingDay, prevYear, prevMonth);

    return {
      startDate: new Date(prevYear, prevMonth - 1, closingPrev + 1, 0, 0, 0, 0),
      endDate: new Date(refYear, refMonth - 1, closingInRefMonth, 23, 59, 59, 999)
    };
  }

  const nextMonth = refMonth === 12 ? 1 : refMonth + 1;
  const nextYear = refMonth === 12 ? refYear + 1 : refYear;
  const closingNext = safeDay(closingDay, nextYear, nextMonth);

  return {
    startDate: new Date(refYear, refMonth - 1, closingInRefMonth + 1, 0, 0, 0, 0),
    endDate: new Date(nextYear, nextMonth - 1, closingNext, 23, 59, 59, 999)
  };
}

module.exports = {
  calculateCreditCardBillingPeriod,
  lastDayOfMonth,
  safeDay
};
