const prisma = require('../../config/prisma');
const { calculateNextRunDate } = require('../recurrences/recurrences.service');

function toNumber(value) {
  return Number(value || 0);
}

function toISOString(date) {
  if (!date) return null;
  return new Date(date).toISOString();
}

function getStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getMonthRange(year, month) {
  const monthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { monthStart, monthEnd };
}

function getTransactionInclude() {
  return {
    category: {
      select: { id: true, name: true, color: true, type: true }
    },
    account: {
      select: { id: true, name: true }
    },
    credit_card: {
      select: { id: true, name: true, brand: true, closing_day: true, due_day: true }
    }
  };
}

function getRecurrenceInclude() {
  return {
    account: {
      select: { id: true, name: true }
    },
    creditCard: {
      select: { id: true, name: true, brand: true, closing_day: true, due_day: true }
    },
    category: {
      select: { id: true, name: true, color: true, type: true }
    }
  };
}

function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getUTCFullYear() === d2.getUTCFullYear()
    && d1.getUTCMonth() === d2.getUTCMonth()
    && d1.getUTCDate() === d2.getUTCDate();
}

function buildEventFromTransaction(transaction) {
  return {
    id: transaction.id,
    kind: 'TRANSACTION',
    title: transaction.description,
    description: transaction.description,
    type: transaction.type,
    status: transaction.status === 'CONFIRMED' ? 'PAID' : (transaction.status === 'PENDING' ? 'PENDING' : 'SCHEDULED'),
    amount: toNumber(transaction.amount),
    date: transaction.transaction_date.toISOString(),
    category: transaction.category ? {
      id: transaction.category.id,
      name: transaction.category.name,
      color: transaction.category.color
    } : null,
    account: transaction.account ? {
      id: transaction.account.id,
      name: transaction.account.name
    } : null,
    creditCard: transaction.credit_card ? {
      id: transaction.credit_card.id,
      name: transaction.credit_card.name,
      brand: transaction.credit_card.brand
    } : null,
    recurrenceId: transaction.recurrence_id || null
  };
}

function buildEventFromRecurrencePreview(recurrence, date) {
  return {
    id: `recurrence-preview-${recurrence.id}-${date}`,
    kind: 'RECURRENCE_PREVIEW',
    title: recurrence.description,
    description: recurrence.description,
    type: recurrence.type,
    status: 'SCHEDULED',
    amount: toNumber(recurrence.amount),
    date: new Date(date).toISOString(),
    category: recurrence.category ? {
      id: recurrence.category.id,
      name: recurrence.category.name,
      color: recurrence.category.color
    } : null,
    account: recurrence.account ? {
      id: recurrence.account.id,
      name: recurrence.account.name
    } : null,
    creditCard: recurrence.creditCard ? {
      id: recurrence.creditCard.id,
      name: recurrence.creditCard.name,
      brand: recurrence.creditCard.brand
    } : null,
    recurrenceId: recurrence.id
  };
}

function getRecurringDatesInMonth(recurrence, year, month) {
  const { monthStart, monthEnd } = getMonthRange(year, month);
  const dates = [];

  if (recurrence.status !== 'ACTIVE') return dates;

  const startDate = new Date(recurrence.startDate);
  const endDate = recurrence.endDate ? new Date(recurrence.endDate) : null;

  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  const monthEndTime = monthEnd.getTime();

  while (currentDate.getTime() <= monthEndTime) {
    if (endDate && currentDate.getTime() > endDate.getTime()) break;

    if (currentDate.getTime() >= monthStart.getTime() && currentDate.getTime() <= monthEndTime) {
      dates.push(new Date(currentDate).toISOString().split('T')[0]);
    }

    currentDate = calculateNextRunDate(currentDate, recurrence.frequency);
    currentDate.setHours(0, 0, 0, 0);
  }

  return dates;
}

async function buildFinancialCalendar({ tenantId, year, month }) {
  const { monthStart, monthEnd } = getMonthRange(year, month);

  const transactions = await prisma.transaction.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: { not: 'CANCELED' },
      transaction_date: {
        gte: monthStart,
        lte: monthEnd
      }
    },
    include: getTransactionInclude(),
    orderBy: { transaction_date: 'asc' }
  });

  const recurrences = await prisma.recurrence.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: 'ACTIVE',
      startDate: { lte: monthEnd }
    },
    include: getRecurrenceInclude()
  });

  const transactionDatesByDay = new Map();
  const transactionRecurrenceIdsByDay = new Map();

  for (const tx of transactions) {
    const dayKey = tx.transaction_date.toISOString().split('T')[0];

    if (!transactionDatesByDay.has(dayKey)) {
      transactionDatesByDay.set(dayKey, []);
    }
    transactionDatesByDay.get(dayKey).push(tx);

    if (tx.recurrence_id) {
      if (!transactionRecurrenceIdsByDay.has(dayKey)) {
        transactionRecurrenceIdsByDay.set(dayKey, new Set());
      }
      transactionRecurrenceIdsByDay.get(dayKey).add(tx.recurrence_id);
    }
  }

  const eventsByDay = new Map();

  for (const tx of transactions) {
    const dayKey = tx.transaction_date.toISOString().split('T')[0];
    const event = buildEventFromTransaction(tx);

    if (!eventsByDay.has(dayKey)) {
      eventsByDay.set(dayKey, { income: 0, expense: 0, events: [] });
    }

    const dayData = eventsByDay.get(dayKey);
    if (tx.type === 'INCOME') {
      dayData.income += toNumber(tx.amount);
    } else {
      dayData.expense += toNumber(tx.amount);
    }
    dayData.events.push(event);
  }

  for (const recurrence of recurrences) {
    const recurringDates = getRecurringDatesInMonth(recurrence, year, month);

    for (const dateStr of recurringDates) {
      const existingTxSet = transactionRecurrenceIdsByDay.get(dateStr);
      if (existingTxSet && existingTxSet.has(recurrence.id)) {
        continue;
      }

      const event = buildEventFromRecurrencePreview(recurrence, dateStr);

      if (!eventsByDay.has(dateStr)) {
        eventsByDay.set(dateStr, { income: 0, expense: 0, events: [] });
      }

      const dayData = eventsByDay.get(dateStr);
      if (recurrence.type === 'INCOME') {
        dayData.income += toNumber(recurrence.amount);
      } else {
        dayData.expense += toNumber(recurrence.amount);
      }
      dayData.events.push(event);
    }
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(Date.UTC(year, month - 1, day));
    const dateStr = date.toISOString().split('T')[0];

    const dayData = eventsByDay.get(dateStr) || { income: 0, expense: 0, events: [] };

    days.push({
      date: dateStr,
      income: Math.round(dayData.income * 100) / 100,
      expense: Math.round(dayData.expense * 100) / 100,
      balance: Math.round((dayData.income - dayData.expense) * 100) / 100,
      events: dayData.events
    });
  }

  let totalIncome = 0;
  let totalExpense = 0;
  let scheduledIncome = 0;
  let scheduledExpense = 0;
  let paidIncome = 0;
  let paidExpense = 0;
  let pendingIncome = 0;
  let pendingExpense = 0;
  let eventCount = 0;

  for (const day of days) {
    totalIncome += day.income;
    totalExpense += day.expense;
    eventCount += day.events.length;

    for (const event of day.events) {
      if (event.type === 'INCOME') {
        scheduledIncome += event.amount;
        if (event.status === 'PAID') paidIncome += event.amount;
        if (event.status === 'PENDING') pendingIncome += event.amount;
      } else {
        scheduledExpense += event.amount;
        if (event.status === 'PAID') paidExpense += event.amount;
        if (event.status === 'PENDING') pendingExpense += event.amount;
      }
    }
  }

  const projectedBalance = scheduledIncome - scheduledExpense;

  return {
    year,
    month,
    summary: {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      scheduledIncome: Math.round(scheduledIncome * 100) / 100,
      scheduledExpense: Math.round(scheduledExpense * 100) / 100,
      paidIncome: Math.round(paidIncome * 100) / 100,
      paidExpense: Math.round(paidExpense * 100) / 100,
      pendingIncome: Math.round(pendingIncome * 100) / 100,
      pendingExpense: Math.round(pendingExpense * 100) / 100,
      projectedBalance: Math.round(projectedBalance * 100) / 100,
      eventCount
    },
    days
  };
}

module.exports = {
  buildFinancialCalendar,
  getRecurringDatesInMonth
};
