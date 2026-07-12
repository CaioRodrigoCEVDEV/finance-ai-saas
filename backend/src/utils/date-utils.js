const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parseLocalDate(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined;
  }

  const str = String(value).trim();

  if (DATE_ONLY_REGEX.test(str)) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0);
  }

  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) {
    return new Date('invalid');
  }
  return parsed;
}

function formatDateOnly(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = {
  parseLocalDate,
  formatDateOnly
};
