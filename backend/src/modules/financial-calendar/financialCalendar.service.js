const prisma = require('../../config/prisma');
const { formatDateOnly } = require('../../utils/date-utils');

function toNumber(value) {
  return Number(value || 0);
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

function buildEventFromTransaction(transaction) {
  return {
    id: transaction.id,
    kind: 'TRANSACTION',
    title: transaction.description,
    description: transaction.description,
    type: transaction.type,
    status: transaction.status === 'CONFIRMED' ? 'PAID' : (transaction.status === 'PENDING' ? 'PENDING' : 'SCHEDULED'),
    amount: toNumber(transaction.amount),
    date: formatDateOnly(transaction.transaction_date),
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
    } : null
  };
}

async function buildFinancialCalendar({ tenantId, year, month }) {
  const { monthStart, monthEnd } = getMonthRange(year, month);

  const transactions = await prisma.transaction.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      transaction_date: {
        gte: monthStart,
        lte: monthEnd
      }
    },
    include: getTransactionInclude(),
    orderBy: { transaction_date: 'asc' }
  });

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

  const debugInfo = {
    transactionCount: transactions.length,
    transactionIds: transactions.map(tx => tx.id),
    transactionDates: transactions.map(tx => formatDateOnly(tx.transaction_date)),
    transactionAmounts: transactions.map(tx => ({ id: tx.id, amount: toNumber(tx.amount), type: tx.type })),
    totalIncomeCalculated: Math.round(totalIncome * 100) / 100,
    totalExpenseCalculated: Math.round(totalExpense * 100) / 100
  };

  console.log('[Calendar Debug]', JSON.stringify(debugInfo, null, 2));

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
    days,
    _debug: debugInfo
  };
}

module.exports = {
  buildFinancialCalendar
};
