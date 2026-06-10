function createUtcMonthRange(year, month) {
  return {
    start: new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))
  };
}

function getCurrentMonthRange() {
  const now = new Date();

  return createUtcMonthRange(now.getUTCFullYear(), now.getUTCMonth());
}

function formatMonthKey(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}

function getLastMonths(count) {
  const now = new Date();
  const months = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const reference = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    const range = createUtcMonthRange(reference.getUTCFullYear(), reference.getUTCMonth());

    months.push({
      key: formatMonthKey(reference),
      start: range.start,
      end: range.end
    });
  }

  return months;
}

module.exports = {
  formatMonthKey,
  getCurrentMonthRange,
  getLastMonths
};
