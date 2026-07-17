const prisma = require('../../config/prisma');
const { getCreditCardExpenseAmountMap } = require('../../utils/credit-card-limit');
const notificationsService = require('./notifications.service');

function toNumber(value) {
  return Number(value || 0);
}

function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function getMonthRange(month, year) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

async function generateBudgetAlerts(tenantId) {
  const { month, year } = getCurrentMonthYear();
  const range = getMonthRange(month, year);
  let created = 0;

  const budgets = await prisma.budget.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      month,
      year
    },
    include: {
      category: {
        select: { id: true, name: true }
      }
    }
  });

  if (!budgets.length) return created;

  const categoryIds = budgets.map((b) => b.category_id);

  const groupedTransactions = await prisma.transaction.groupBy({
    by: ['category_id'],
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      type: 'EXPENSE',
      status: 'CONFIRMED',
      category_id: { in: categoryIds },
      transaction_date: {
        gte: range.start,
        lte: range.end
      }
    },
    _sum: { amount: true }
  });

  const usedByCategory = new Map();
  for (const item of groupedTransactions) {
    usedByCategory.set(item.category_id, toNumber(item._sum.amount));
  }

  for (const budget of budgets) {
    const amount = toNumber(budget.amount);
    const used = usedByCategory.get(budget.category_id) || 0;
    const usedPercentage = amount > 0 ? (used / amount) * 100 : 0;

    if (usedPercentage >= 100) {
      const result = await notificationsService.createNotificationIfNotExists(
        {
          title: 'Orcamento excedido',
          message: `O orcamento "${budget.name}" da categoria ${budget.category.name} foi excedido. Gasto: ${formatCurrency(used)} de ${formatCurrency(amount)} (${usedPercentage.toFixed(1)}%).`,
          type: 'BUDGET_EXCEEDED',
          referenceId: budget.id,
          referenceType: 'budget',
          metadata: { month, year, usedPercentage, usedAmount: used, budgetAmount: amount }
        },
        tenantId
      );
      if (result) created++;
    } else if (usedPercentage >= 80) {
      const result = await notificationsService.createNotificationIfNotExists(
        {
          title: 'Orcamento proximo do limite',
          message: `O orcamento "${budget.name}" da categoria ${budget.category.name} atingiu ${usedPercentage.toFixed(1)}%. Gasto: ${formatCurrency(used)} de ${formatCurrency(amount)}.`,
          type: 'BUDGET_WARNING',
          referenceId: budget.id,
          referenceType: 'budget',
          metadata: { month, year, usedPercentage, usedAmount: used, budgetAmount: amount }
        },
        tenantId
      );
      if (result) created++;
    }
  }

  return created;
}

async function generateUncategorizedTransactionAlerts(tenantId) {
  const { month, year } = getCurrentMonthYear();
  const range = getMonthRange(month, year);

  const uncategorizedCount = await prisma.transaction.count({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      type: 'EXPENSE',
      status: 'CONFIRMED',
      category_id: null,
      transaction_date: {
        gte: range.start,
        lte: range.end
      }
    }
  });

  if (uncategorizedCount === 0) return 0;

  const result = await notificationsService.createNotificationIfNotExists(
    {
      title: 'Transacoes sem categoria',
      message: `Existem ${uncategorizedCount} transacao(oes) sem categoria no mes atual. Categorize para melhorar seus relatorios.`,
      type: 'UNCATEGORIZED_TRANSACTIONS',
      referenceId: null,
      referenceType: 'uncategorized',
      metadata: { month, year, count: uncategorizedCount }
    },
    tenantId
  );

  return result ? 1 : 0;
}

async function generateGoalCompletedAlerts(tenantId) {
  let created = 0;

  const completedGoals = await prisma.goal.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'COMPLETED'
    }
  });

  for (const goal of completedGoals) {
    const result = await notificationsService.createNotificationIfNotExists(
      {
        title: 'Meta concluida',
        message: `Parabens! A meta "${goal.name}" foi concluida com sucesso. Valor alcancado: ${formatCurrency(toNumber(goal.current_amount))}.`,
        type: 'GOAL_COMPLETED',
        referenceId: goal.id,
        referenceType: 'goal',
        metadata: {
          targetAmount: toNumber(goal.target_amount),
          currentAmount: toNumber(goal.current_amount)
        }
      },
      tenantId
    );
    if (result) created++;
  }

  return created;
}

async function generateCreditCardLimitAlerts(tenantId) {
  let created = 0;
  const { month, year } = getCurrentMonthYear();

  const creditCards = await prisma.creditCard.findMany({
    where: {
      tenant_id: tenantId,
      is_active: true,
      deleted_at: null
    }
  });

  if (!creditCards.length) return created;

  const creditCardIds = creditCards.map((c) => c.id);

  const usedByCard = await getCreditCardExpenseAmountMap(prisma, tenantId, creditCardIds, { excludePaidInvoices: true });

  for (const card of creditCards) {
    const limitAmount = toNumber(card.limit_amount);
    const used = usedByCard.get(card.id) || 0;
    const usedPercentage = limitAmount > 0 ? (used / limitAmount) * 100 : 0;

    if (usedPercentage >= 80) {
      const result = await notificationsService.createNotificationIfNotExists(
        {
          title: 'Limite do cartao proximo',
          message: `O cartao "${card.name}" atingiu ${usedPercentage.toFixed(1)}% do limite. Uso em aberto: ${formatCurrency(used)} de ${formatCurrency(limitAmount)}.`,
          type: 'CREDIT_CARD_LIMIT',
          referenceId: card.id,
          referenceType: 'credit-card',
          metadata: { month, year, usedPercentage, usedAmount: used, limitAmount }
        },
        tenantId
      );
      if (result) created++;
    }
  }

  return created;
}

async function generateGoalOverdueAlerts(tenantId) {
  let created = 0;

  const overdueGoals = await prisma.goal.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'ACTIVE',
      deadline: { lt: new Date() }
    },
    select: { id: true, name: true, deadline: true }
  });

  for (const goal of overdueGoals) {
    const result = await notificationsService.createNotificationIfNotExists(
      {
        title: 'Meta vencida',
        message: `A meta "${goal.name}" venceu em ${goal.deadline.toLocaleDateString('pt-BR')} e ainda nao foi concluida.`,
        type: 'GOAL_OVERDUE',
        referenceId: goal.id,
        referenceType: 'goal',
        metadata: { deadline: goal.deadline.toISOString() }
      },
      tenantId
    );
    if (result) created++;
  }

  return created;
}

async function generateLowBalanceAlerts(tenantId) {
  const accounts = await prisma.account.findMany({
    where: {
      tenant_id: tenantId,
      is_active: true,
      deleted_at: null,
      consider_in_available_balance: true
    },
    select: { id: true, initial_balance: true }
  });

  if (accounts.length === 0) return 0;

  const accountIds = accounts.map((a) => a.id);

  const transactionTotals = await prisma.transaction.groupBy({
    by: ['account_id', 'type'],
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      account_id: { in: accountIds }
    },
    _sum: { amount: true }
  });

  const accountTxMap = {};
  for (const agg of transactionTotals) {
    if (!accountTxMap[agg.account_id]) {
      accountTxMap[agg.account_id] = { INCOME: 0, EXPENSE: 0 };
    }
    const amount = toNumber(agg._sum.amount);
    if (agg.type === 'INCOME') {
      accountTxMap[agg.account_id].INCOME += amount;
    } else if (agg.type === 'EXPENSE') {
      accountTxMap[agg.account_id].EXPENSE += amount;
    }
  }

  let totalBalance = 0;
  for (const account of accounts) {
    const tx = accountTxMap[account.id] || { INCOME: 0, EXPENSE: 0 };
    totalBalance += toNumber(account.initial_balance) + tx.INCOME - tx.EXPENSE;
  }

  if (totalBalance >= 100) return 0;

  const result = await notificationsService.createNotificationIfNotExists(
    {
      title: 'Saldo total baixo',
      message: `Seu saldo total consolidado e de ${formatCurrency(totalBalance)}. Considere revisar suas financas.`,
      type: 'LOW_BALANCE',
      referenceId: null,
      referenceType: 'summary',
      metadata: { totalBalance }
    },
    tenantId
  );

  return result ? 1 : 0;
}

async function generateExpenseGreaterThanIncomeAlerts(tenantId) {
  const { month, year } = getCurrentMonthYear();
  const range = getMonthRange(month, year);

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

  const expenseAgg = await prisma.transaction.aggregate({
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
  const monthlyExpense = toNumber(expenseAgg._sum.amount);

  if (monthlyExpense <= monthlyIncome) return 0;

  const result = await notificationsService.createNotificationIfNotExists(
    {
      title: 'Despesas superam receitas',
      message: `Suas despesas pagas (${formatCurrency(monthlyExpense)}) sao maiores que suas receitas (${formatCurrency(monthlyIncome)}) no mes atual.`,
      type: 'EXPENSE_GREATER_THAN_INCOME',
      referenceId: null,
      referenceType: 'summary',
      metadata: { month, year, income: monthlyIncome, expense: monthlyExpense }
    },
    tenantId
  );

  return result ? 1 : 0;
}

async function generateFinancialAlerts(tenantId) {
  const budgetCreated = await generateBudgetAlerts(tenantId);
  const uncategorizedCreated = await generateUncategorizedTransactionAlerts(tenantId);
  const goalsCreated = await generateGoalCompletedAlerts(tenantId);
  const creditCardCreated = await generateCreditCardLimitAlerts(tenantId);
  const goalOverdueCreated = await generateGoalOverdueAlerts(tenantId);
  const lowBalanceCreated = await generateLowBalanceAlerts(tenantId);
  const expenseGreaterThanIncomeCreated = await generateExpenseGreaterThanIncomeAlerts(tenantId);

  const totalCreated = budgetCreated + uncategorizedCreated + goalsCreated + creditCardCreated + goalOverdueCreated + lowBalanceCreated + expenseGreaterThanIncomeCreated;

  return {
    message: totalCreated > 0
      ? `${totalCreated} alerta(s) gerado(s) com sucesso`
      : 'Nenhum alerta novo para gerar',
    totalCreated,
    details: {
      budgetAlerts: budgetCreated,
      uncategorizedTransactions: uncategorizedCreated,
      goalCompleted: goalsCreated,
      creditCardLimit: creditCardCreated,
      goalOverdue: goalOverdueCreated,
      lowBalance: lowBalanceCreated,
      expenseGreaterThanIncome: expenseGreaterThanIncomeCreated
    }
  };
}

module.exports = {
  generateFinancialAlerts
};
