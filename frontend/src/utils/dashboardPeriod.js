const STORAGE_KEY = 'financeai_dashboard_period';

function getCurrentDashboardPeriod() {
  const now = new Date();

  return {
    month: now.getUTCMonth() + 1,
    year: now.getUTCFullYear()
  };
}

function normalizeDashboardPeriod(month, year) {
  const current = getCurrentDashboardPeriod();
  const selectedMonth = Number.isInteger(month) && month >= 1 && month <= 12 ? month : current.month;
  const selectedYear = Number.isInteger(year) && year >= 2000 && year <= 3000 ? year : current.year;

  return {
    month: selectedMonth,
    year: selectedYear
  };
}

function getDashboardPeriodKey(period) {
  const normalized = normalizeDashboardPeriod(period?.month, period?.year);

  return `${normalized.year}-${String(normalized.month).padStart(2, '0')}`;
}

function parseDashboardPeriodValue(value) {
  if (!value) return null;

  const [yearText, monthText] = String(value).split('-');
  const month = Number(monthText);
  const year = Number(yearText);

  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  if (!Number.isInteger(year) || year < 2000 || year > 3000) return null;

  return { month, year };
}

function shiftDashboardPeriod(period, offset) {
  const normalized = normalizeDashboardPeriod(period?.month, period?.year);
  const reference = new Date(Date.UTC(normalized.year, normalized.month - 1 + offset, 1));
  const year = reference.getUTCFullYear();

  if (year < 2000) {
    return { month: 1, year: 2000 };
  }

  if (year > 3000) {
    return { month: 12, year: 3000 };
  }

  return {
    month: reference.getUTCMonth() + 1,
    year
  };
}

function formatDashboardPeriodLabel(month, year) {
  const normalized = normalizeDashboardPeriod(month, year);
  const date = new Date(Date.UTC(normalized.year, normalized.month - 1, 1));
  const monthName = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    timeZone: 'UTC'
  }).format(date);

  return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${normalized.year}`;
}

function buildDashboardPeriodOptions(period, rangeYears = 2) {
  const normalized = normalizeDashboardPeriod(period?.month, period?.year);
  const options = [];
  const startYear = Math.max(2000, normalized.year - rangeYears);
  const endYear = Math.min(3000, normalized.year + rangeYears);

  for (let year = startYear; year <= endYear; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      options.push({
        value: `${year}-${String(month).padStart(2, '0')}`,
        label: formatDashboardPeriodLabel(month, year)
      });
    }
  }

  return options;
}

function readStoredDashboardPeriod() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (!parsed || typeof parsed !== 'object') return null;

    return normalizeDashboardPeriod(parsed.month, parsed.year);
  } catch (_error) {
    return null;
  }
}

function writeStoredDashboardPeriod(period) {
  try {
    const normalized = normalizeDashboardPeriod(period?.month, period?.year);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (_error) {
  }
}

export {
  STORAGE_KEY,
  buildDashboardPeriodOptions,
  formatDashboardPeriodLabel,
  getCurrentDashboardPeriod,
  getDashboardPeriodKey,
  normalizeDashboardPeriod,
  parseDashboardPeriodValue,
  readStoredDashboardPeriod,
  shiftDashboardPeriod,
  writeStoredDashboardPeriod
};
