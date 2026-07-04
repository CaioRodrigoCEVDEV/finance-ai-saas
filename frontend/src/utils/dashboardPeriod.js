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

function buildHojeLabel() {
  const hoje = getCurrentDashboardPeriod();
  return `Hoje (${formatDashboardPeriodLabel(hoje.month, hoje.year)})`;
}

function buildNavList(periods) {
  const hoje = getCurrentDashboardPeriod();
  const hojeKey = getDashboardPeriodKey(hoje);
  const seen = new Set([hojeKey]);
  const list = [{ year: hoje.year, month: hoje.month }];

  for (const p of periods) {
    const key = `${p.year}-${String(p.month).padStart(2, '0')}`;
    if (!seen.has(key)) {
      seen.add(key);
      list.push({ year: p.year, month: p.month });
    }
  }

  return list.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}

function buildAvailablePeriodOptions(periods) {
  const hoje = getCurrentDashboardPeriod();
  const hojeKey = getDashboardPeriodKey(hoje);
  const hojeLabel = buildHojeLabel();
  const hojeOption = { value: hojeKey, label: hojeLabel };
  const rest = (periods || [])
    .filter((p) => {
      const key = `${p.year}-${String(p.month).padStart(2, '0')}`;
      return key !== hojeKey;
    })
    .map((p) => ({
      value: `${p.year}-${String(p.month).padStart(2, '0')}`,
      label: p.label
    }));

  return [hojeOption, ...rest];
}

function getPeriodIndex(periods, current) {
  return periods.findIndex((p) => p.year === current.year && p.month === current.month);
}

function shiftPeriodByList(periods, current, direction) {
  const navList = buildNavList(periods || []);

  if (navList.length === 0) return current;

  const idx = getPeriodIndex(navList, current);

  if (idx === -1) {
    return { month: navList[0].month, year: navList[0].year };
  }

  const target = idx - direction;

  if (target < 0) {
    return { month: navList[0].month, year: navList[0].year };
  }

  if (target >= navList.length) {
    return { month: navList[navList.length - 1].month, year: navList[navList.length - 1].year };
  }

  return { month: navList[target].month, year: navList[target].year };
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
  buildAvailablePeriodOptions,
  formatDashboardPeriodLabel,
  getCurrentDashboardPeriod,
  getDashboardPeriodKey,
  normalizeDashboardPeriod,
  parseDashboardPeriodValue,
  readStoredDashboardPeriod,
  shiftDashboardPeriod,
  shiftPeriodByList,
  writeStoredDashboardPeriod
};
