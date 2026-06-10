const prisma = require('../../config/prisma');
const {
  formatMonthKey,
  getCurrentMonthRange,
  getLastMonths
} = require('./dashboard-date-helper');

const UNCATEGORIZED_LABEL = 'Sem categoria';

function toNumber(value) {
  return Number(value || 0);
}

function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };
}

async function getSummary(tenantId) {
  const currentMonth = getCurrentMonthRange();

  const [accountBalance, transactionTotals] = await Promise.all([
    prisma.account.aggregate({
      where: {
        tenant_id: tenantId,
        is_active: true,
        deleted_at: null
      },
      _sum: {
        current_balance: true
      }
    }),
    prisma.transaction.groupBy({
      by: ['type'],
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        status: 'CONFIRMED',
        transaction_date: {
          gte: currentMonth.start,
          lte: currentMonth.end
        },
        type: {
          in: ['INCOME', 'EXPENSE']
        }
      },
      _sum: {
        amount: true
      }
    })
  ]);

  const monthlyIncome = toNumber(
    transactionTotals.find((item) => item.type === 'INCOME')?._sum.amount
  );
  const monthlyExpense = toNumber(
    transactionTotals.find((item) => item.type === 'EXPENSE')?._sum.amount
  );
  const monthlyEconomy = monthlyIncome - monthlyExpense;
  const expensePercentage = monthlyIncome > 0
    ? Number(((monthlyExpense / monthlyIncome) * 100).toFixed(2))
    : 0;

  return {
    summary: {
      totalBalance: toNumber(accountBalance._sum.current_balance),
      monthlyIncome,
      monthlyExpense,
      monthlyEconomy,
      expensePercentage
    }
  };
}

async function getExpensesByCategory(tenantId) {
  const currentMonth = getCurrentMonthRange();

  const groupedExpenses = await prisma.transaction.groupBy({
    by: ['category_id'],
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      type: 'EXPENSE',
      transaction_date: {
        gte: currentMonth.start,
        lte: currentMonth.end
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
        id: {
          in: categoryIds
        }
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

async function getRecentTransactions(tenantId) {

  const transactions = await prisma.transaction.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null
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
    transactionDate: transaction.transaction_date.toISOString()
  }));
}

async function getMonthlyFlow(tenantId) {
  const months = getLastMonths(6);

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
      }
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

  return months.map((month) => {
    const monthData = monthlyTotals.get(month.key);

    monthData.economy = monthData.income - monthData.expense;

    return monthData;
  });
}

async function getOverview(tenantId) {
  const currentMonth = getCurrentMonthRange();
  const { month, year } = getCurrentMonthYear();

  const summaryData = await getSummary(tenantId);

  const investmentAgg = await prisma.transaction.aggregate({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      transaction_date: { gte: currentMonth.start, lte: currentMonth.end },
      type: 'INVESTMENT'
    },
    _sum: { amount: true }
  });

  const monthlyInvestment = toNumber(investmentAgg._sum.amount);
  const summary = {
    ...summaryData.summary,
    monthlyInvestment,
    monthlyEconomy: Number((summaryData.summary.monthlyIncome - summaryData.summary.monthlyExpense - monthlyInvestment).toFixed(2))
  };

  const accounts = await prisma.account.findMany({
    where: { tenant_id: tenantId, deleted_at: null },
    select: { id: true, is_active: true, current_balance: true }
  });

  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.is_active).length;
  const totalBalanceAccounts = accounts
    .filter((a) => a.is_active)
    .reduce((sum, a) => sum + toNumber(a.current_balance), 0);

  const creditCards = await prisma.creditCard.findMany({
    where: { tenant_id: tenantId, deleted_at: null },
    select: { id: true, name: true, limit_amount: true, is_active: true }
  });

  const creditCardIds = creditCards.map((c) => c.id);
  let ccTransactionMap = new Map();

  if (creditCardIds.length > 0) {
    const creditCardTransactions = await prisma.transaction.groupBy({
      by: ['credit_card_id'],
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        status: 'CONFIRMED',
        type: 'EXPENSE',
        transaction_date: { gte: currentMonth.start, lte: currentMonth.end },
        credit_card_id: { in: creditCardIds }
      },
      _sum: { amount: true }
    });
    ccTransactionMap = new Map(creditCardTransactions.map((t) => [t.credit_card_id, toNumber(t._sum.amount)]));
  }

  const totalCards = creditCards.length;
  const activeCards = creditCards.filter((c) => c.is_active).length;
  const totalLimit = creditCards.reduce((sum, c) => sum + toNumber(c.limit_amount), 0);
  const currentInvoiceAmount = creditCards.reduce((sum, c) => sum + (ccTransactionMap.get(c.id) || 0), 0);
  const availableLimit = Math.max(totalLimit - currentInvoiceAmount, 0);
  const usagePercentage = totalLimit > 0 ? Number(((currentInvoiceAmount / totalLimit) * 100).toFixed(2)) : 0;

  const budgetsList = await prisma.budget.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
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
        transaction_date: { gte: currentMonth.start, lte: currentMonth.end },
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
    where: { tenant_id: tenantId, deleted_at: null },
    select: { id: true, status: true, target_amount: true, current_amount: true }
  });

  const totalGoals = goals.length;
  const activeGoals = goals.filter((g) => g.status === 'ACTIVE').length;
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED').length;
  const totalTargetAmount = goals.reduce((sum, g) => sum + toNumber(g.target_amount), 0);
  const totalCurrentAmount = goals.reduce((sum, g) => sum + toNumber(g.current_amount), 0);
  const overallProgressPercentage = totalTargetAmount > 0 ? Number(((totalCurrentAmount / totalTargetAmount) * 100).toFixed(2)) : 0;

  return {
    summary,
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
    }
  };
}

async function getAlerts(tenantId) {
  const currentMonth = getCurrentMonthRange();
  const { month, year } = getCurrentMonthYear();
  const alerts = [];

  const budgets = await prisma.budget.findMany({
    where: { tenant_id: tenantId, deleted_at: null, month, year },
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
        transaction_date: { gte: currentMonth.start, lte: currentMonth.end },
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
    where: { tenant_id: tenantId, deleted_at: null, is_active: true },
    select: { id: true, name: true, limit_amount: true }
  });

  const ccIds = creditCards.map((c) => c.id);
  let ccTransactionMap = new Map();

  if (ccIds.length > 0) {
    const ccTransactions = await prisma.transaction.groupBy({
      by: ['credit_card_id'],
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        status: 'CONFIRMED',
        type: 'EXPENSE',
        transaction_date: { gte: currentMonth.start, lte: currentMonth.end },
        credit_card_id: { in: ccIds }
      },
      _sum: { amount: true }
    });
    ccTransactionMap = new Map(ccTransactions.map((t) => [t.credit_card_id, toNumber(t._sum.amount)]));
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

  const now = new Date();
  const overdueGoals = await prisma.goal.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'ACTIVE',
      deadline: { lt: now }
    },
    select: { id: true, name: true, deadline: true }
  });

  overdueGoals.forEach((g) => {
    alerts.push({
      type: 'GOAL_OVERDUE',
      severity: 'warning',
      title: 'Meta vencida',
      message: `A meta ${g.name} venceu em ${g.deadline.toISOString().split('T')[0]} e ainda não foi concluída.`,
      entityId: g.id,
      entityType: 'goal'
    });
  });

  const incomeAgg = await prisma.transaction.aggregate({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      transaction_date: { gte: currentMonth.start, lte: currentMonth.end },
      type: 'INCOME'
    },
    _sum: { amount: true }
  });

  const expenseAgg = await prisma.transaction.aggregate({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      transaction_date: { gte: currentMonth.start, lte: currentMonth.end },
      type: 'EXPENSE'
    },
    _sum: { amount: true }
  });

  const monthlyIncome = toNumber(incomeAgg._sum.amount);
  const monthlyExpense = toNumber(expenseAgg._sum.amount);

  if (monthlyExpense > monthlyIncome) {
    alerts.push({
      type: 'EXPENSE_GREATER_THAN_INCOME',
      severity: 'danger',
      title: 'Despesas superam receitas',
      message: `Suas despesas (${monthlyExpense.toFixed(2)}) são maiores que suas receitas (${monthlyIncome.toFixed(2)}) neste mês.`,
      entityId: null,
      entityType: 'summary'
    });
  }

  const accountBalance = await prisma.account.aggregate({
    where: { tenant_id: tenantId, deleted_at: null, is_active: true },
    _sum: { current_balance: true }
  });

  const totalBalance = toNumber(accountBalance._sum.current_balance);

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

async function getTopExpenses(tenantId) {
  const currentMonth = getCurrentMonthRange();

  const transactions = await prisma.transaction.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      type: 'EXPENSE',
      transaction_date: { gte: currentMonth.start, lte: currentMonth.end }
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
    transactionDate: t.transaction_date.toISOString()
  }));
}

async function getBudgetStatus(tenantId) {
  const currentMonth = getCurrentMonthRange();
  const { month, year } = getCurrentMonthYear();

  const budgets = await prisma.budget.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
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
        transaction_date: { gte: currentMonth.start, lte: currentMonth.end },
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

async function getGoalsProgress(tenantId) {
  const goals = await prisma.goal.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'ACTIVE'
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
      deadline: g.deadline ? g.deadline.toISOString() : null
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
  getGoalsProgress
};
