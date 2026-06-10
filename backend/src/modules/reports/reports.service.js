const prisma = require('../../config/prisma');

function toNumber(value) {
  return Number(value || 0);
}

function getStartOfDay(date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function getEndOfDay(date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(23, 59, 59, 999);
  return normalizedDate;
}

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function buildWhere(tenantId, filters) {
  const where = {
    tenant_id: tenantId,
    deleted_at: null,
    status: 'CONFIRMED'
  };

  const { startDate, endDate, accountId, creditCardId, categoryId, type } = filters;

  if (startDate || endDate) {
    where.transaction_date = {};
    if (startDate) {
      where.transaction_date.gte = getStartOfDay(startDate);
    }
    if (endDate) {
      where.transaction_date.lte = getEndOfDay(endDate);
    }
  }

  if (accountId) {
    where.account_id = accountId;
  }

  if (creditCardId) {
    where.credit_card_id = creditCardId;
  }

  if (categoryId) {
    where.category_id = categoryId;
  }

  if (type) {
    where.type = type;
  }

  return where;
}

function buildListWhere(tenantId, filters) {
  const where = {
    tenant_id: tenantId,
    deleted_at: null
  };

  const { startDate, endDate, accountId, creditCardId, categoryId, type, status } = filters;

  if (startDate || endDate) {
    where.transaction_date = {};
    if (startDate) {
      where.transaction_date.gte = getStartOfDay(startDate);
    }
    if (endDate) {
      where.transaction_date.lte = getEndOfDay(endDate);
    }
  }

  if (accountId) {
    where.account_id = accountId;
  }

  if (creditCardId) {
    where.credit_card_id = creditCardId;
  }

  if (categoryId) {
    where.category_id = categoryId;
  }

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  return where;
}

async function getFinancialSummary(tenantId, filters) {
  const period = (filters.startDate && filters.endDate)
    ? { start: getStartOfDay(filters.startDate), end: getEndOfDay(filters.endDate) }
    : getCurrentMonthRange();

  const where = {
    tenant_id: tenantId,
    deleted_at: null,
    status: 'CONFIRMED',
    transaction_date: {
      gte: period.start,
      lte: period.end
    }
  };

  if (filters.accountId) {
    where.account_id = filters.accountId;
  }

  if (filters.creditCardId) {
    where.credit_card_id = filters.creditCardId;
  }

  if (filters.categoryId) {
    where.category_id = filters.categoryId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  const [totals, totalTransactions, expenseTransactions] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['type'],
      where: {
        ...where,
        type: {
          in: ['INCOME', 'EXPENSE', 'INVESTMENT']
        }
      },
      _sum: {
        amount: true
      }
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where: {
        ...where,
        type: 'EXPENSE'
      },
      select: {
        amount: true
      }
    })
  ]);

  const income = toNumber(totals.find((item) => item.type === 'INCOME')?._sum.amount);
  const expense = toNumber(totals.find((item) => item.type === 'EXPENSE')?._sum.amount);
  const investment = toNumber(totals.find((item) => item.type === 'INVESTMENT')?._sum.amount);

  const expenseCount = expenseTransactions.length;
  const biggestExpense = expenseCount > 0
    ? Math.max(...expenseTransactions.map((t) => toNumber(t.amount)))
    : 0;

  const averageExpense = expenseCount > 0
    ? Number((expense / expenseCount).toFixed(2))
    : 0;

  return {
    income,
    expense,
    investment,
    balance: Number((income - expense - investment).toFixed(2)),
    totalTransactions,
    averageExpense,
    biggestExpense,
    period: {
      startDate: period.start.toISOString().split('T')[0],
      endDate: period.end.toISOString().split('T')[0]
    }
  };
}

async function getReportByCategory(tenantId, filters) {
  const where = buildWhere(tenantId, filters);

  const totals = await prisma.transaction.groupBy({
    by: ['category_id', 'type'],
    where,
    _sum: {
      amount: true
    },
    _count: {
      id: true
    }
  });

  const categories = await prisma.category.findMany({
    where: {
      OR: [
        {
          tenant_id: null,
          is_default: true
        },
        {
          tenant_id: tenantId
        }
      ],
      deleted_at: null
    },
    select: {
      id: true,
      name: true,
      type: true
    }
  });

  const categoryMap = new Map();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const totalAmount = totals.reduce((sum, item) => sum + toNumber(item._sum.amount), 0);

  const result = totals.map((item) => {
    const category = item.category_id ? categoryMap.get(item.category_id) : null;
    const amount = toNumber(item._sum.amount);

    return {
      categoryId: item.category_id || 'none',
      categoryName: category ? category.name : 'Sem categoria',
      type: item.type,
      amount,
      transactionCount: item._count.id,
      percentage: totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(2)) : 0
    };
  });

  result.sort((a, b) => b.amount - a.amount);

  return result;
}

async function getReportByAccount(tenantId, filters) {
  const where = buildWhere(tenantId, filters);

  const totals = await prisma.transaction.groupBy({
    by: ['account_id', 'type'],
    where: {
      ...where,
      account_id: {
        not: null
      }
    },
    _sum: {
      amount: true
    },
    _count: {
      id: true
    }
  });

  const accounts = await prisma.account.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null
    },
    select: {
      id: true,
      name: true
    }
  });

  const accountMap = new Map();
  accounts.forEach((a) => accountMap.set(a.id, a));

  const grouped = new Map();

  totals.forEach((item) => {
    const account = accountMap.get(item.account_id);
    if (!account) return;

    if (!grouped.has(account.id)) {
      grouped.set(account.id, {
        accountId: account.id,
        accountName: account.name,
        income: 0,
        expense: 0,
        balance: 0,
        transactionCount: 0
      });
    }

    const entry = grouped.get(account.id);
    const amount = toNumber(item._sum.amount);

    if (item.type === 'INCOME') {
      entry.income += amount;
    } else if (item.type === 'EXPENSE' || item.type === 'INVESTMENT') {
      entry.expense += amount;
    }

    entry.transactionCount += item._count.id;
  });

  const result = Array.from(grouped.values());
  result.forEach((r) => {
    r.balance = Number((r.income - r.expense).toFixed(2));
    r.income = Number(r.income.toFixed(2));
    r.expense = Number(r.expense.toFixed(2));
  });

  result.sort((a, b) => b.balance - a.balance);

  return result;
}

async function getReportByCreditCard(tenantId, filters) {
  const where = buildWhere(tenantId, filters);

  const totals = await prisma.transaction.groupBy({
    by: ['credit_card_id'],
    where: {
      ...where,
      credit_card_id: {
        not: null
      },
      type: 'EXPENSE'
    },
    _sum: {
      amount: true
    },
    _count: {
      id: true
    }
  });

  const creditCards = await prisma.creditCard.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null
    },
    select: {
      id: true,
      name: true
    }
  });

  const cardMap = new Map();
  creditCards.forEach((c) => cardMap.set(c.id, c));

  const result = totals.map((item) => {
    const card = cardMap.get(item.credit_card_id);
    return {
      creditCardId: item.credit_card_id,
      creditCardName: card ? card.name : 'Cartao desconhecido',
      expense: toNumber(item._sum.amount),
      transactionCount: item._count.id
    };
  });

  result.sort((a, b) => b.expense - a.expense);

  return result;
}

async function getMonthlyEvolution(tenantId, filters) {
  let startDate;
  let endDate;

  if (filters.startDate && filters.endDate) {
    startDate = getStartOfDay(filters.startDate);
    endDate = getEndOfDay(filters.endDate);
  } else {
    const now = new Date();
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0);
  }

  const where = {
    tenant_id: tenantId,
    deleted_at: null,
    status: 'CONFIRMED',
    transaction_date: {
      gte: startDate,
      lte: endDate
    }
  };

  if (filters.accountId) {
    where.account_id = filters.accountId;
  }

  if (filters.creditCardId) {
    where.credit_card_id = filters.creditCardId;
  }

  if (filters.categoryId) {
    where.category_id = filters.categoryId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    select: {
      type: true,
      amount: true,
      transaction_date: true
    }
  });

  const monthsMap = new Map();

  const current = new Date(startDate);
  while (current.getTime() <= endDate.getTime()) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    monthsMap.set(key, {
      month: key,
      income: 0,
      expense: 0,
      investment: 0,
      balance: 0
    });
    current.setMonth(current.getMonth() + 1);
  }

  transactions.forEach((t) => {
    const key = `${t.transaction_date.getFullYear()}-${String(t.transaction_date.getMonth() + 1).padStart(2, '0')}`;
    const entry = monthsMap.get(key);
    if (!entry) return;

    const amount = toNumber(t.amount);

    if (t.type === 'INCOME') {
      entry.income += amount;
    } else if (t.type === 'EXPENSE') {
      entry.expense += amount;
    } else if (t.type === 'INVESTMENT') {
      entry.investment += amount;
    }
  });

  const result = Array.from(monthsMap.values());
  result.forEach((r) => {
    r.income = Number(r.income.toFixed(2));
    r.expense = Number(r.expense.toFixed(2));
    r.investment = Number(r.investment.toFixed(2));
    r.balance = Number((r.income - r.expense - r.investment).toFixed(2));
  });

  return result;
}

async function getTopExpenses(tenantId, filters, limit = 10) {
  const where = buildWhere(tenantId, filters);

  where.type = 'EXPENSE';

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      },
      account: {
        select: {
          id: true,
          name: true
        }
      },
      credit_card: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      amount: 'desc'
    },
    take: limit
  });

  return transactions.map((t) => ({
    id: t.id,
    description: t.description,
    amount: toNumber(t.amount),
    categoryName: t.category ? t.category.name : null,
    accountName: t.account ? t.account.name : null,
    creditCardName: t.credit_card ? t.credit_card.name : null,
    transactionDate: t.transaction_date.toISOString()
  }));
}

async function getTransactionsForExport(tenantId, filters) {
  const where = buildListWhere(tenantId, filters);

  return prisma.transaction.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      },
      account: {
        select: {
          id: true,
          name: true
        }
      },
      credit_card: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [
      { transaction_date: 'desc' },
      { created_at: 'desc' }
    ]
  });
}

module.exports = {
  getFinancialSummary,
  getReportByCategory,
  getReportByAccount,
  getReportByCreditCard,
  getMonthlyEvolution,
  getTopExpenses,
  getTransactionsForExport
};
