const prisma = require('../../config/prisma');
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
  const range = getMonthRange(month, year);

  const creditCards = await prisma.creditCard.findMany({
    where: {
      tenant_id: tenantId,
      is_active: true,
      deleted_at: null
    }
  });

  if (!creditCards.length) return created;

  const creditCardIds = creditCards.map((c) => c.id);

  const groupedTransactions = await prisma.transaction.groupBy({
    by: ['credit_card_id'],
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      type: 'EXPENSE',
      status: 'CONFIRMED',
      credit_card_id: { in: creditCardIds },
      transaction_date: {
        gte: range.start,
        lte: range.end
      }
    },
    _sum: { amount: true }
  });

  const usedByCard = new Map();
  for (const item of groupedTransactions) {
    usedByCard.set(item.credit_card_id, toNumber(item._sum.amount));
  }

  for (const card of creditCards) {
    const limitAmount = toNumber(card.limit_amount);
    const used = usedByCard.get(card.id) || 0;
    const usedPercentage = limitAmount > 0 ? (used / limitAmount) * 100 : 0;

    if (usedPercentage >= 80) {
      const result = await notificationsService.createNotificationIfNotExists(
        {
          title: 'Limite do cartao proximo',
          message: `O cartao "${card.name}" atingiu ${usedPercentage.toFixed(1)}% do limite. Fatura atual: ${formatCurrency(used)} de ${formatCurrency(limitAmount)}.`,
          type: 'CREDIT_CARD_LIMIT',
          referenceId: card.id,
          referenceType: 'credit-card',
          metadata: { month, year, usedPercentage, currentInvoice: used, limitAmount }
        },
        tenantId
      );
      if (result) created++;
    }
  }

  return created;
}

async function generateFinancialAlerts(tenantId) {
  const results = {
    budgetWarning: 0,
    budgetExceeded: 0,
    uncategorizedTransactions: 0,
    goalCompleted: 0,
    creditCardLimit: 0
  };

  const budgetCreated = await generateBudgetAlerts(tenantId);
  const uncategorizedCreated = await generateUncategorizedTransactionAlerts(tenantId);
  const goalsCreated = await generateGoalCompletedAlerts(tenantId);
  const creditCardCreated = await generateCreditCardLimitAlerts(tenantId);

  const totalCreated = budgetCreated + uncategorizedCreated + goalsCreated + creditCardCreated;

  return {
    message: totalCreated > 0
      ? `${totalCreated} alerta(s) gerado(s) com sucesso`
      : 'Nenhum alerta novo para gerar',
    totalCreated,
    details: {
      uncategorizedTransactions: uncategorizedCreated,
      goalCompleted: goalsCreated,
      creditCardLimit: creditCardCreated,
      budgetAlerts: budgetCreated
    }
  };
}

module.exports = {
  generateFinancialAlerts
};
