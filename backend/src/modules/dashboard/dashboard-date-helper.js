function createUtcMonthRange(year, month) {
  return {
    start: new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))
  };
}

function getCurrentMonthYear() {
  const now = new Date();

  return {
    month: now.getUTCMonth() + 1,
    year: now.getUTCFullYear()
  };
}

function shiftUtcMonth(year, month, offset) {
  const reference = new Date(Date.UTC(year, month - 1 + offset, 1));

  return {
    month: reference.getUTCMonth() + 1,
    year: reference.getUTCFullYear()
  };
}

function getCurrentMonthRange(month, year) {
  if (Number.isInteger(month) && Number.isInteger(year)) {
    return createUtcMonthRange(year, month - 1);
  }

  const current = getCurrentMonthYear();

  return createUtcMonthRange(current.year, current.month - 1);
}

function resolveDashboardPeriod(month, year) {
  const current = getCurrentMonthYear();
  const selectedMonth = Number.isInteger(month) ? month : current.month;
  const selectedYear = Number.isInteger(year) ? year : current.year;
  const range = createUtcMonthRange(selectedYear, selectedMonth - 1);
  const previous = shiftUtcMonth(selectedYear, selectedMonth, -1);
  const previousRange = createUtcMonthRange(previous.year, previous.month - 1);

  return {
    month: selectedMonth,
    year: selectedYear,
    key: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
    range,
    previous: {
      ...previous,
      key: `${previous.year}-${String(previous.month).padStart(2, '0')}`,
      range: previousRange
    }
  };
}

function formatMonthKey(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}

function getLastMonths(count, month, year) {
  const anchor = resolveDashboardPeriod(month, year);
  const months = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const reference = new Date(Date.UTC(anchor.year, anchor.month - 1 - offset, 1));
    const range = createUtcMonthRange(reference.getUTCFullYear(), reference.getUTCMonth());

    months.push({
      month: reference.getUTCMonth() + 1,
      year: reference.getUTCFullYear(),
      key: formatMonthKey(reference),
      start: range.start,
      end: range.end
    });
  }

  return months;
}

module.exports = {
  getCurrentMonthYear,
  formatMonthKey,
  getCurrentMonthRange,
  getLastMonths,
  resolveDashboardPeriod,
  shiftUtcMonth
};
