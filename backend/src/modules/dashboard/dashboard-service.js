const prisma = require('../../config/prisma');
const {
  formatMonthKey,
  getLastMonths,
  resolveDashboardPeriod
} = require('./dashboard-date-helper');
const { getCreditCardExpenseAmountMap } = require('../../utils/credit-card-limit');
const { calculateCreditCardBillingPeriod, calculateInvoiceAmountForCards } = require('../../utils/credit-card-invoice');
const { formatDateOnly } = require('../../utils/date-utils');

const UNCATEGORIZED_LABEL = 'Sem categoria';

function toNumber(value) {
  return Number(value || 0);
}

function buildCashFlowExpenseWhere(baseWhere) {
  return {
    ...baseWhere,
    type: 'EXPENSE',
    payment_method: { not: 'CREDIT_CARD' }
  };
}

function buildComparison(current, previous) {
  const currentValue = toNumber(current);
  const previousValue = toNumber(previous);
  const delta = Number((currentValue - previousValue).toFixed(2));
  const percentage = previousValue === 0
    ? (currentValue === 0 ? 0 : 100)
    : Number(((delta / Math.abs(previousValue)) * 100).toFixed(2));

  return {
    current: currentValue,
    previous: previousValue,
    delta,
    percentage,
    trend: delta > 0 ? 'up' : (delta < 0 ? 'down' : 'flat')
  };
}

async function computeTotalBalance(tenantId, endDate) {
  const accounts = await prisma.account.findMany({
    where: {
      tenant_id: tenantId,
      is_active: true,
      deleted_at: null,
      ...(endDate ? { created_at: { lte: endDate } } : {})
    },
    select: {
      id: true,
      initial_balance: true
    }
  });

  const accountIds = accounts.map((a) => a.id);

  if (accountIds.length === 0) {
    return 0;
  }

  const transactionTotals = await prisma.transaction.groupBy({
    by: ['account_id', 'type'],
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      account_id: {
        in: accountIds
      },
      ...(endDate ? { transaction_date: { lte: endDate } } : {})
    },
    _sum: {
      amount: true
    }
  });

  const accountTransactionTotals = {};

  for (const aggregate of transactionTotals) {
    if (!accountTransactionTotals[aggregate.account_id]) {
      accountTransactionTotals[aggregate.account_id] = { INCOME: 0, EXPENSE: 0 };
    }

    const amount = toNumber(aggregate._sum.amount);

    if (aggregate.type === 'INCOME') {
      accountTransactionTotals[aggregate.account_id].INCOME += amount;
      continue;
    }

    accountTransactionTotals[aggregate.account_id].EXPENSE += amount;
  }

  let total = 0;

  for (const account of accounts) {
    const tx = accountTransactionTotals[account.id] || { INCOME: 0, EXPENSE: 0 };
    total += toNumber(account.initial_balance) + tx.INCOME - tx.EXPENSE;
  }

  return Number(total.toFixed(2));
}

async function getPeriodSummaryMetrics(tenantId, range) {
  const baseWhere = {
    tenant_id: tenantId,
    deleted_at: null,
    status: 'CONFIRMED',
    transaction_date: {
      gte: range.start,
      lte: range.end
    }
  };

  const [incomeResult, expensePaidResult, creditCardSpentResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...baseWhere, type: 'INCOME' },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: buildCashFlowExpenseWhere(baseWhere),
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { ...baseWhere, type: 'EXPENSE', payment_method: 'CREDIT_CARD' },
      _sum: { amount: true }
    })
  ]);

  const monthlyIncome = toNumber(incomeResult._sum.amount);
  const monthlyExpensePaid = toNumber(expensePaidResult._sum.amount);
  const monthlyCreditCardSpent = toNumber(creditCardSpentResult._sum.amount);
  const monthlyEconomy = Number((monthlyIncome - monthlyExpensePaid).toFixed(2));
  const expensePercentage = monthlyIncome > 0
    ? Number(((monthlyExpensePaid / monthlyIncome) * 100).toFixed(2))
    : 0;

  return {
    monthlyIncome,
    monthlyExpensePaid,
    monthlyCreditCardSpent,
    monthlyEconomy,
    expensePercentage
  };
}

async function getSummary(tenantId, periodInput = {}) {
  const period = resolveDashboardPeriod(periodInput.month, periodInput.year);

  const [totalBalance, transactionTotals, previousSummary, previousTotalBalance] = await Promise.all([
    computeTotalBalance(tenantId, period.range.end),
    getPeriodSummaryMetrics(tenantId, period.range),
    getPeriodSummaryMetrics(tenantId, period.previous.range),
    computeTotalBalance(tenantId, period.previous.range.end)
  ]);

  return {
    period: {
      month: period.month,
      year: period.year,
      key: period.key
    },
    previousPeriod: {
      month: period.previous.month,
      year: period.previous.year,
      key: period.previous.key
    },
    summary: {
      totalBalance,
      ...transactionTotals
    },
    comparison: {
      totalBalance: buildComparison(totalBalance, previousTotalBalance),
      monthlyIncome: buildComparison(transactionTotals.monthlyIncome, previousSummary.monthlyIncome),
      monthlyExpensePaid: buildComparison(transactionTotals.monthlyExpensePaid, previousSummary.monthlyExpensePaid),
      monthlyCreditCardSpent: buildComparison(transactionTotals.monthlyCreditCardSpent, previousSummary.monthlyCreditCardSpent),
      monthlyEconomy: buildComparison(transactionTotals.monthlyEconomy, previousSummary.monthlyEconomy)
    }
  };
}

async function getExpenseCategoryRows(tenantId, range) {
  const groupedExpenses = await prisma.transaction.groupBy({
    by: ['category_id'],
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      type: 'EXPENSE',
      payment_method: { not: 'CREDIT_CARD' },
      transaction_date: {
        gte: range.start,
        lte: range.end
      }
    },
    _sum: {
      amount: true
    },
    orderBy: {
      _sum: {
        amount: 'desc'
      }
    }
  });

  const categoryIds = groupedExpenses
    .map((item) => item.category_id)
    .filter(Boolean);

  const categories = categoryIds.length > 0
    ? await prisma.category.findMany({
      where: {
        deleted_at: null,
        id: {
          in: categoryIds
        },
        OR: [
          { tenant_id: tenantId },
          { tenant_id: null }
        ]
      },
      select: {
        id: true,
        name: true
      }
    })
    : [];

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const totalExpense = groupedExpenses.reduce((sum, item) => sum + toNumber(item._sum.amount), 0);

  return groupedExpenses.map((item) => {
    const amount = toNumber(item._sum.amount);
    const percentage = totalExpense > 0
      ? Number(((amount / totalExpense) * 100).toFixed(2))
      : 0;

    return {
      categoryId: item.category_id,
      categoryName: item.category_id ? (categoryMap.get(item.category_id) || UNCATEGORIZED_LABEL) : UNCATEGORIZED_LABEL,
      amount,
      percentage
    };
  });
}

async function getExpensesByCategory(tenantId, periodInput = {}) {
  const period = resolveDashboardPeriod(periodInput.month, periodInput.year);

  const [currentItems, previousItems] = await Promise.all([
    getExpenseCategoryRows(tenantId, period.range),
    getExpenseCategoryRows(tenantId, period.previous.range)
  ]);

  const previousMap = new Map(previousItems.map((item) => [item.categoryId || '__uncategorized__', item]));

  return currentItems.map((item) => {
    const previous = previousMap.get(item.categoryId || '__uncategorized__');
    const comparison = buildComparison(item.amount, previous?.amount || 0);

    return {
      ...item,
      previousAmount: previous?.amount || 0,
      deltaAmount: comparison.delta,
      deltaPercentage: comparison.percentage,
      trend: comparison.trend
    };
  });
}

async function getRecentTransactions(tenantId, periodInput = {}) {
  const period = resolveDashboardPeriod(periodInput.month, periodInput.year);

  const transactions = await prisma.transaction.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      transaction_date: {
        gte: period.range.start,
        lte: period.range.end
      }
    },
    orderBy: {
      transaction_date: 'desc'
    },
    take: 10,
    select: {
      id: true,
      description: true,
      amount: true,
      type: true,
      status: true,
      transaction_date: true,
      category: {
        select: {
          name: true
        }
      },
      account: {
        select: {
          name: true
        }
      },
      credit_card: {
        select: {
          name: true
        }
      }
    }
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    description: transaction.description,
    amount: toNumber(transaction.amount),
    type: transaction.type,
    status: transaction.status,
    categoryName: transaction.category?.name || UNCATEGORIZED_LABEL,
    accountName: transaction.account?.name || null,
    creditCardName: transaction.credit_card?.name || null,
    transactionDate: formatDateOnly(transaction.transaction_date)
  }));
}

async function getMonthlyFlow(tenantId, periodInput = {}) {
  const period = resolveDashboardPeriod(periodInput.month, periodInput.year);
  const months = getLastMonths(6, period.month, period.year);

  const transactions = await prisma.transaction.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      transaction_date: {
        gte: months[0].start,
        lte: months[months.length - 1].end
      },
      type: {
        in: ['INCOME', 'EXPENSE']
      },
      payment_method: { not: 'CREDIT_CARD' }
    },
    select: {
      amount: true,
      type: true,
      transaction_date: true
    }
  });

  const monthlyTotals = new Map(
    months.map((month) => [month.key, { month: month.key, income: 0, expense: 0, economy: 0 }])
  );

  for (const transaction of transactions) {
    const monthKey = formatMonthKey(transaction.transaction_date);
    const monthData = monthlyTotals.get(monthKey);

    if (!monthData) {
      continue;
    }

    const amount = toNumber(transaction.amount);

    if (transaction.type === 'INCOME') {
      monthData.income += amount;
      continue;
    }

    if (transaction.type === 'EXPENSE') {
      monthData.expense += amount;
    }
  }

  return months
    .map((month) => {
      const monthData = monthlyTotals.get(month.key);

      monthData.economy = monthData.income - monthData.expense;

      return monthData;
    })
    .filter((m) => m.income > 0 || m.expense > 0);
}

async function getAvailablePeriods(tenantId) {
  const rows = await prisma.$queryRaw`
    SELECT
      EXTRACT(YEAR FROM transaction_date)::int AS year,
      EXTRACT(MONTH FROM transaction_date)::int AS month
    FROM transactions
    WHERE tenant_id = ${tenantId}::uuid
      AND deleted_at IS NULL
    GROUP BY
      EXTRACT(YEAR FROM transaction_date),
      EXTRACT(MONTH FROM transaction_date)
    ORDER BY year DESC, month DESC
  `;

  return rows.map((r) => {
    const year = Number(r.year);
    const month = Number(r.month);
    const date = new Date(Date.UTC(year, month - 1, 1));
    const monthName = new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      timeZone: 'UTC'
    }).format(date);

    return {
      year,
      month,
      label: `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${year}`
    };
  });
}

async function getOverview(tenantId, periodInput = {}) {
  const period = resolveDashboardPeriod(periodInput.month, periodInput.year);
  const summaryData = await getSummary(tenantId, periodInput);
  const { month, year } = period;
  const { range } = period;

  const summary = summaryData.summary;

  const accounts = await prisma.account.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      created_at: { lte: range.end }
    },
    select: { id: true, is_active: true }
  });

  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.is_active).length;

  const totalBalanceAccounts = summaryData.summary.totalBalance;

  const creditCards = await prisma.creditCard.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      created_at: { lte: range.end }
    },
    select: { id: true, name: true, limit_amount: true, is_active: true, closing_day: true }
  });

  const creditCardIds = creditCards.map((c) => c.id);
  let currentInvoiceMap = new Map();
  let usedLimitMap = new Map();

  if (creditCardIds.length > 0) {
    const cardRanges = new Map();

    creditCards.forEach((c) => {
      const period = calculateCreditCardBillingPeriod(c.closing_day, new Date());
      cardRanges.set(c.id, { start: period.startDate, end: period.endDate });
    });

    [currentInvoiceMap, usedLimitMap] = await Promise.all([
      calculateInvoiceAmountForCards(prisma, tenantId, creditCardIds, cardRanges),
      getCreditCardExpenseAmountMap(prisma, tenantId, creditCardIds, { cardRanges, excludePaidInvoices: true })
    ]);
  }

  const totalCards = creditCards.length;
  const activeCards = creditCards.filter((c) => c.is_active).length;
  const totalLimit = creditCards.reduce((sum, c) => sum + toNumber(c.limit_amount), 0);
  const currentInvoiceAmount = creditCards.reduce((sum, c) => sum + (currentInvoiceMap.get(c.id) || 0), 0);
  const usedLimitAmount = creditCards.reduce((sum, c) => sum + (usedLimitMap.get(c.id) || 0), 0);
  const availableLimit = Math.max(totalLimit - usedLimitAmount, 0);
  const usagePercentage = totalLimit > 0 ? Number(((usedLimitAmount / totalLimit) * 100).toFixed(2)) : 0;

  const budgetsList = await prisma.budget.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      created_at: { lte: range.end },
      month,
      year
    },
    select: {
      id: true,
      name: true,
      amount: true,
      category_id: true,
      category: { select: { name: true } }
    }
  });

  const budgetCategoryIds = budgetsList.map((b) => b.category_id).filter(Boolean);
  let budgetTransactionMap = new Map();

  if (budgetCategoryIds.length > 0) {
    const budgetTransactions = await prisma.transaction.groupBy({
      by: ['category_id'],
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        status: 'CONFIRMED',
        type: 'EXPENSE',
        transaction_date: { gte: range.start, lte: range.end },
        category_id: { in: budgetCategoryIds }
      },
      _sum: { amount: true }
    });
    budgetTransactionMap = new Map(budgetTransactions.map((t) => [t.category_id, toNumber(t._sum.amount)]));
  }

  let totalBudget = 0;
  let totalUsed = 0;
  let warningCount = 0;
  let exceededCount = 0;

  budgetsList.forEach((b) => {
    const amount = toNumber(b.amount);
    const usedAmount = budgetTransactionMap.get(b.category_id) || 0;
    const usedPercentage = amount > 0 ? Number(((usedAmount / amount) * 100).toFixed(2)) : 0;
    const status = usedPercentage > 100 ? 'EXCEEDED' : (usedPercentage > 80 ? 'WARNING' : 'SAFE');

    totalBudget += amount;
    totalUsed += usedAmount;
    if (status === 'WARNING') warningCount += 1;
    if (status === 'EXCEEDED') exceededCount += 1;
  });

  const totalRemaining = totalBudget - totalUsed;
  const budgetUsedPercentage = totalBudget > 0 ? Number(((totalUsed / totalBudget) * 100).toFixed(2)) : 0;

  const goals = await prisma.goal.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      created_at: { lte: range.end }
    },
    select: { id: true, status: true, target_amount: true, current_amount: true }
  });

  const totalGoals = goals.length;
  const activeGoals = goals.filter((g) => g.status === 'ACTIVE').length;
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED').length;
  const totalTargetAmount = goals.reduce((sum, g) => sum + toNumber(g.target_amount), 0);
  const totalCurrentAmount = goals.reduce((sum, g) => sum + toNumber(g.current_amount), 0);
  const overallProgressPercentage = totalTargetAmount > 0 ? Number(((totalCurrentAmount / totalTargetAmount) * 100).toFixed(2)) : 0;

  const now = new Date();

  const financialTasks = await prisma.financialTask.findMany({
    where: {
      tenantId,
      deletedAt: null,
      createdAt: { lte: range.end }
    },
    select: {
      id: true,
      status: true,
      priority: true,
      dueDate: true,
      title: true,
      estimatedAmount: true,
      account: { select: { name: true } }
    }
  });

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const totalTasks = financialTasks.length;
  const pendingTasks = financialTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
  const completedTasks = financialTasks.filter((t) => t.status === 'COMPLETED').length;
  const overdueTasks = financialTasks.filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.dueDate && t.dueDate < now
  ).length;
  const todayTasks = financialTasks.filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.dueDate && t.dueDate >= startOfToday && t.dueDate <= endOfToday
  ).length;

  return {
    summary,
    comparison: summaryData.comparison,
    accounts: {
      totalAccounts,
      activeAccounts,
      totalBalance: totalBalanceAccounts
    },
    creditCards: {
      totalCards,
      activeCards,
      totalLimit,
      currentInvoiceAmount,
      availableLimit,
      usagePercentage
    },
    budgets: {
      totalBudget,
      totalUsed,
      totalRemaining,
      usedPercentage: budgetUsedPercentage,
      warningCount,
      exceededCount
    },
    goals: {
      totalGoals,
      activeGoals,
      completedGoals,
      totalTargetAmount,
      totalCurrentAmount,
      overallProgressPercentage
    },
    financialTasks: {
      totalTasks,
      pendingTasks,
      completedTasks,
      overdueTasks,
      todayTasks
    }
  };
}

async function getAlerts(tenantId, periodInput = {}) {
  const period = resolveDashboardPeriod(periodInput.month, periodInput.year);
  const { month, year, range } = period;
  const alerts = [];

  const budgets = await prisma.budget.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      created_at: { lte: range.end },
      month,
      year
    },
    select: { id: true, name: true, amount: true, category_id: true, category: { select: { name: true } } }
  });

  const budgetCategoryIds = budgets.map((b) => b.category_id).filter(Boolean);
  let budgetTransactionMap = new Map();

  if (budgetCategoryIds.length > 0) {
    const budgetTransactions = await prisma.transaction.groupBy({
      by: ['category_id'],
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        status: 'CONFIRMED',
        type: 'EXPENSE',
        transaction_date: { gte: range.start, lte: range.end },
        category_id: { in: budgetCategoryIds }
      },
      _sum: { amount: true }
    });
    budgetTransactionMap = new Map(budgetTransactions.map((t) => [t.category_id, toNumber(t._sum.amount)]));
  }

  budgets.forEach((b) => {
    const amount = toNumber(b.amount);
    const used = budgetTransactionMap.get(b.category_id) || 0;
    const percentage = amount > 0 ? (used / amount) * 100 : 0;

    if (percentage > 100) {
      alerts.push({
        type: 'BUDGET_EXCEEDED',
        severity: 'danger',
        title: 'Orçamento excedido',
        message: `Você já usou ${percentage.toFixed(0)}% do orçamento de ${b.category?.name || b.name}.`,
        entityId: b.id,
        entityType: 'budget'
      });
    } else if (percentage > 80) {
      alerts.push({
        type: 'BUDGET_WARNING',
        severity: 'warning',
        title: 'Orçamento quase no limite',
        message: `Você já usou ${percentage.toFixed(0)}% do orçamento de ${b.category?.name || b.name}.`,
        entityId: b.id,
        entityType: 'budget'
      });
    }
  });

  const creditCards = await prisma.creditCard.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      is_active: true,
      created_at: { lte: range.end }
    },
    select: { id: true, name: true, limit_amount: true, closing_day: true }
  });

  const ccIds = creditCards.map((c) => c.id);
  let ccTransactionMap = new Map();

  if (ccIds.length > 0) {
    const ccCardRanges = new Map();

    creditCards.forEach((c) => {
      const period = calculateCreditCardBillingPeriod(c.closing_day, new Date());
      ccCardRanges.set(c.id, { start: period.startDate, end: period.endDate });
    });

    ccTransactionMap = await getCreditCardExpenseAmountMap(prisma, tenantId, ccIds, { cardRanges: ccCardRanges, excludePaidInvoices: true });
  }

  creditCards.forEach((c) => {
    const limit = toNumber(c.limit_amount);
    const used = ccTransactionMap.get(c.id) || 0;
    const percentage = limit > 0 ? (used / limit) * 100 : 0;

    if (percentage > 80) {
      alerts.push({
        type: 'CREDIT_CARD_HIGH_USAGE',
        severity: 'warning',
        title: 'Cartão com alto uso',
        message: `Você já usou ${percentage.toFixed(0)}% do limite do cartão ${c.name}.`,
        entityId: c.id,
        entityType: 'creditCard'
      });
    }
  });

  const overdueGoals = await prisma.goal.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'ACTIVE',
      created_at: { lte: range.end },
      deadline: { lt: range.end }
    },
    select: { id: true, name: true, deadline: true }
  });

  overdueGoals.forEach((g) => {
    alerts.push({
      type: 'GOAL_OVERDUE',
      severity: 'warning',
      title: 'Meta vencida',
      message: `A meta ${g.name} venceu em ${formatDateOnly(g.deadline)} e ainda não foi concluída.`,
      entityId: g.id,
      entityType: 'goal'
    });
  });

  const incomeAgg = await prisma.transaction.aggregate({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      transaction_date: { gte: range.start, lte: range.end },
      type: 'INCOME'
    },
    _sum: { amount: true }
  });

  const expensePaidAgg = await prisma.transaction.aggregate({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      transaction_date: { gte: range.start, lte: range.end },
      type: 'EXPENSE',
      payment_method: { not: 'CREDIT_CARD' }
    },
    _sum: { amount: true }
  });

  const monthlyIncome = toNumber(incomeAgg._sum.amount);
  const monthlyExpensePaid = toNumber(expensePaidAgg._sum.amount);

  if (monthlyExpensePaid > monthlyIncome) {
    alerts.push({
      type: 'EXPENSE_GREATER_THAN_INCOME',
      severity: 'danger',
      title: 'Despesas superam receitas',
      message: `Suas despesas pagas (${monthlyExpensePaid.toFixed(2)}) são maiores que suas receitas (${monthlyIncome.toFixed(2)}) no período selecionado.`,
      entityId: null,
      entityType: 'summary'
    });
  }

  const overdueTasks = await prisma.financialTask.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: { notIn: ['COMPLETED', 'CANCELLED'] },
      dueDate: { lt: range.end }
    },
    select: { id: true, title: true, dueDate: true }
  });

  overdueTasks.forEach((t) => {
    alerts.push({
      type: 'TASK_OVERDUE',
      severity: 'danger',
      title: 'Tarefa financeira atrasada',
      message: `A tarefa "${t.title}" venceu em ${formatDateOnly(t.dueDate)} e ainda não foi concluída.`,
      entityId: t.id,
      entityType: 'financialTask'
    });
  });

  const totalBalance = await computeTotalBalance(tenantId, range.end);

  if (totalBalance < 100) {
    alerts.push({
      type: 'LOW_BALANCE',
      severity: 'warning',
      title: 'Saldo total baixo',
      message: `Seu saldo total consolidado é de ${totalBalance.toFixed(2)}. Considere revisar suas finanças.`,
      entityId: null,
      entityType: 'summary'
    });
  }

  return alerts;
}

async function getTopExpenses(tenantId, periodInput = {}) {
  const period = resolveDashboardPeriod(periodInput.month, periodInput.year);

  const transactions = await prisma.transaction.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      type: 'EXPENSE',
      payment_method: { not: 'CREDIT_CARD' },
      transaction_date: { gte: period.range.start, lte: period.range.end }
    },
    orderBy: { amount: 'desc' },
    take: 5,
    select: {
      id: true,
      description: true,
      amount: true,
      transaction_date: true,
      category: { select: { name: true } }
    }
  });

  return transactions.map((t) => ({
    id: t.id,
    description: t.description,
    amount: toNumber(t.amount),
    categoryName: t.category?.name || UNCATEGORIZED_LABEL,
    transactionDate: formatDateOnly(t.transaction_date)
  }));
}

async function getBudgetStatus(tenantId, periodInput = {}) {
  const period = resolveDashboardPeriod(periodInput.month, periodInput.year);
  const { month, year, range } = period;

  const budgets = await prisma.budget.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      created_at: { lte: range.end },
      month,
      year
    },
    select: {
      id: true,
      name: true,
      amount: true,
      category_id: true,
      category: { select: { name: true } }
    }
  });

  const budgetCategoryIds = budgets.map((b) => b.category_id).filter(Boolean);
  let budgetTransactionMap = new Map();

  if (budgetCategoryIds.length > 0) {
    const budgetTransactions = await prisma.transaction.groupBy({
      by: ['category_id'],
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        status: 'CONFIRMED',
        type: 'EXPENSE',
        transaction_date: { gte: range.start, lte: range.end },
        category_id: { in: budgetCategoryIds }
      },
      _sum: { amount: true }
    });
    budgetTransactionMap = new Map(budgetTransactions.map((t) => [t.category_id, toNumber(t._sum.amount)]));
  }

  return budgets.map((b) => {
    const amount = toNumber(b.amount);
    const usedAmount = budgetTransactionMap.get(b.category_id) || 0;
    const remainingAmount = amount - usedAmount;
    const usedPercentage = amount > 0 ? Number(((usedAmount / amount) * 100).toFixed(2)) : 0;
    const status = usedPercentage > 100 ? 'EXCEEDED' : (usedPercentage > 80 ? 'WARNING' : 'SAFE');

    return {
      id: b.id,
      name: b.name,
      categoryName: b.category?.name || UNCATEGORIZED_LABEL,
      amount,
      usedAmount,
      remainingAmount,
      usedPercentage,
      status
    };
  });
}

async function getGoalsProgress(tenantId, periodInput = {}) {
  const period = resolveDashboardPeriod(periodInput.month, periodInput.year);

  const goals = await prisma.goal.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'ACTIVE',
      created_at: { lte: period.range.end }
    },
    orderBy: { created_at: 'asc' },
    select: {
      id: true,
      name: true,
      target_amount: true,
      current_amount: true,
      deadline: true
    }
  });

  return goals.map((g) => {
    const target = toNumber(g.target_amount);
    const current = toNumber(g.current_amount);
    const progressPercentage = target > 0 ? Number(((current / target) * 100).toFixed(2)) : 0;

    return {
      id: g.id,
      name: g.name,
      targetAmount: target,
      currentAmount: current,
      progressPercentage,
      deadline: formatDateOnly(g.deadline)
    };
  });
}

module.exports = {
  getExpensesByCategory,
  getMonthlyFlow,
  getRecentTransactions,
  getSummary,
  getOverview,
  getAlerts,
  getTopExpenses,
  getBudgetStatus,
  getGoalsProgress,
  getAvailablePeriods
};
