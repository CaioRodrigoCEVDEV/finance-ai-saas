const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

function toDecimalString(value) {
  return Number(value || 0).toFixed(2);
}

function toNumber(value) {
  return Number(value || 0);
}

function getReferenceMonthYear(filters = {}) {
  const now = new Date();

  return {
    month: filters.month || now.getMonth() + 1,
    year: filters.year || now.getFullYear()
  };
}

function getMonthRange(month, year) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  return { start, end };
}

function getBudgetInclude() {
  return {
    category: {
      select: {
        id: true,
        name: true,
        type: true
      }
    }
  };
}

function buildAccessibleCategoryWhere(categoryId, tenantId) {
  return {
    id: categoryId,
    deleted_at: null,
    OR: [
      {
        tenant_id: null,
        is_default: true
      },
      {
        tenant_id: tenantId
      }
    ]
  };
}

async function findAccessibleCategory(categoryId, tenantId) {
  return prisma.category.findFirst({
    where: buildAccessibleCategoryWhere(categoryId, tenantId)
  });
}

async function assertValidExpenseCategory(categoryId, tenantId) {
  const category = await findAccessibleCategory(categoryId, tenantId);

  if (!category) {
    throw new AppError('Categoria nao encontrada para o tenant atual', 404);
  }

  if (category.type !== 'EXPENSE') {
    throw new AppError('Categoria do orcamento deve ser do tipo EXPENSE', 400);
  }

  return category;
}

async function findBudgetEntityByTenant(budgetId, tenantId) {
  return prisma.budget.findFirst({
    where: {
      id: budgetId,
      tenant_id: tenantId,
      deleted_at: null
    },
    include: getBudgetInclude()
  });
}

async function assertBudgetUnique({ tenantId, categoryId, month, year, currentBudgetId }) {
  const duplicateBudget = await prisma.budget.findFirst({
    where: {
      tenant_id: tenantId,
      category_id: categoryId,
      month,
      year,
      id: currentBudgetId
        ? {
            not: currentBudgetId
          }
        : undefined
    }
  });

  if (!duplicateBudget) {
    return;
  }

  if (duplicateBudget.deleted_at === null) {
    throw new AppError('Ja existe um orcamento para esta categoria no mes e ano informados', 409);
  }

  throw new AppError('Ja existe um orcamento excluido para esta categoria no mes e ano informados. Pela regra atual do sistema, use outra combinacao ou ajuste o registro existente.', 409);
}

async function getUsedAmountsByCategory(tenantId, month, year, categoryIds) {
  if (!categoryIds.length) {
    return new Map();
  }

  const range = getMonthRange(month, year);
  const groupedTransactions = await prisma.transaction.groupBy({
    by: ['category_id'],
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      type: 'EXPENSE',
      status: 'CONFIRMED',
      category_id: {
        in: categoryIds
      },
      transaction_date: {
        gte: range.start,
        lte: range.end
      }
    },
    _sum: {
      amount: true
    }
  });

  return groupedTransactions.reduce((accumulator, item) => {
    accumulator.set(item.category_id, toNumber(item._sum.amount));
    return accumulator;
  }, new Map());
}

function getBudgetStatus(usedPercentage) {
  if (usedPercentage >= 100) {
    return 'EXCEEDED';
  }

  if (usedPercentage >= 70) {
    return 'WARNING';
  }

  return 'SAFE';
}

function enrichBudgetResponse(budget, usedAmount) {
  const amount = toNumber(budget.amount);
  const normalizedUsedAmount = toNumber(usedAmount);
  const remainingAmount = amount - normalizedUsedAmount;
  const usedPercentage = amount > 0 ? (normalizedUsedAmount / amount) * 100 : 0;

  return {
    id: budget.id,
    name: budget.name,
    amount,
    month: budget.month,
    year: budget.year,
    category: budget.category
      ? {
          id: budget.category.id,
          name: budget.category.name,
          type: budget.category.type
        }
      : null,
    usedAmount: normalizedUsedAmount,
    remainingAmount,
    usedPercentage,
    status: getBudgetStatus(usedPercentage),
    createdAt: budget.created_at.toISOString(),
    updatedAt: budget.updated_at.toISOString()
  };
}

async function listBudgetEntities(tenantId, filters = {}) {
  const { month, year } = getReferenceMonthYear(filters);
  const budgets = await prisma.budget.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      month,
      year,
      category_id: filters.categoryId || undefined
    },
    include: getBudgetInclude(),
    orderBy: [
      { created_at: 'desc' },
      { name: 'asc' }
    ]
  });

  return {
    month,
    year,
    budgets
  };
}

async function listBudgets(tenantId, filters = {}) {
  const { month, year, budgets } = await listBudgetEntities(tenantId, filters);
  const usedAmountsByCategory = await getUsedAmountsByCategory(
    tenantId,
    month,
    year,
    budgets.map((budget) => budget.category_id)
  );

  return budgets.map((budget) => enrichBudgetResponse(budget, usedAmountsByCategory.get(budget.category_id) || 0));
}

async function getBudgetById(budgetId, tenantId) {
  const budget = await findBudgetEntityByTenant(budgetId, tenantId);

  if (!budget) {
    throw new AppError('Orcamento nao encontrado', 404);
  }

  const usedAmountsByCategory = await getUsedAmountsByCategory(tenantId, budget.month, budget.year, [budget.category_id]);

  return enrichBudgetResponse(budget, usedAmountsByCategory.get(budget.category_id) || 0);
}

async function createBudget(data, tenantId) {
  await assertValidExpenseCategory(data.categoryId, tenantId);
  await assertBudgetUnique({
    tenantId,
    categoryId: data.categoryId,
    month: data.month,
    year: data.year
  });

  try {
    const budget = await prisma.budget.create({
      data: {
        tenant_id: tenantId,
        category_id: data.categoryId,
        name: data.name,
        amount: toDecimalString(data.amount),
        month: data.month,
        year: data.year
      },
      include: getBudgetInclude()
    });

    return enrichBudgetResponse(budget, 0);
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError('Ja existe um orcamento para esta categoria no mes e ano informados', 409);
    }

    throw error;
  }
}

async function updateBudget(budgetId, tenantId, data) {
  const existingBudget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });

  if (!existingBudget) {
    throw new AppError('Orcamento nao encontrado', 404);
  }

  const nextCategoryId = data.categoryId ?? existingBudget.category_id;
  const nextMonth = data.month ?? existingBudget.month;
  const nextYear = data.year ?? existingBudget.year;

  await assertValidExpenseCategory(nextCategoryId, tenantId);
  await assertBudgetUnique({
    tenantId,
    categoryId: nextCategoryId,
    month: nextMonth,
    year: nextYear,
    currentBudgetId: existingBudget.id
  });

  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.categoryId !== undefined) {
    updateData.category_id = data.categoryId;
  }

  if (data.amount !== undefined) {
    updateData.amount = toDecimalString(data.amount);
  }

  if (data.month !== undefined) {
    updateData.month = data.month;
  }

  if (data.year !== undefined) {
    updateData.year = data.year;
  }

  try {
    const budget = await prisma.budget.update({
      where: {
        id: existingBudget.id
      },
      data: updateData,
      include: getBudgetInclude()
    });

    const usedAmountsByCategory = await getUsedAmountsByCategory(tenantId, budget.month, budget.year, [budget.category_id]);

    return enrichBudgetResponse(budget, usedAmountsByCategory.get(budget.category_id) || 0);
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError('Ja existe um orcamento para esta categoria no mes e ano informados', 409);
    }

    throw error;
  }
}

async function deleteBudget(budgetId, tenantId) {
  const existingBudget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });

  if (!existingBudget) {
    throw new AppError('Orcamento nao encontrado', 404);
  }

  await prisma.budget.update({
    where: {
      id: existingBudget.id
    },
    data: {
      deleted_at: new Date()
    }
  });

  return {
    message: 'Orcamento excluido com sucesso'
  };
}

async function getMonthSummary(tenantId, filters = {}) {
  const { month, year } = getReferenceMonthYear(filters);
  const budgets = await listBudgets(tenantId, { month, year });

  const summary = budgets.reduce((accumulator, budget) => {
    accumulator.totalBudget += budget.amount;
    accumulator.totalUsed += budget.usedAmount;
    accumulator.totalRemaining += budget.remainingAmount;

    if (budget.status === 'SAFE') {
      accumulator.safeCount += 1;
    }

    if (budget.status === 'WARNING') {
      accumulator.warningCount += 1;
    }

    if (budget.status === 'EXCEEDED') {
      accumulator.exceededCount += 1;
    }

    return accumulator;
  }, {
    totalBudget: 0,
    totalUsed: 0,
    totalRemaining: 0,
    safeCount: 0,
    warningCount: 0,
    exceededCount: 0
  });

  return {
    month,
    year,
    totalBudget: summary.totalBudget,
    totalUsed: summary.totalUsed,
    totalRemaining: summary.totalRemaining,
    usedPercentage: summary.totalBudget > 0 ? (summary.totalUsed / summary.totalBudget) * 100 : 0,
    safeCount: summary.safeCount,
    warningCount: summary.warningCount,
    exceededCount: summary.exceededCount
  };
}

module.exports = {
  listBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getMonthSummary
};
