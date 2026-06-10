const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

function toDecimalString(value) {
  return Number(value || 0).toFixed(2);
}

function toNumber(value) {
  return Number(value || 0);
}

function getDaysRemaining(deadline) {
  if (!deadline) {
    return null;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

function getSuggestedMonthlyContribution(targetAmount, currentAmount, deadline) {
  if (!deadline) {
    return null;
  }

  const daysRemaining = getDaysRemaining(deadline);

  if (daysRemaining === null || daysRemaining <= 0) {
    return null;
  }

  const remainingAmount = targetAmount - currentAmount;

  if (remainingAmount <= 0) {
    return null;
  }

  const monthsRemaining = daysRemaining / 30;

  if (monthsRemaining <= 0) {
    return null;
  }

  return Math.ceil((remainingAmount / monthsRemaining) * 100) / 100;
}

function enrichGoalResponse(goal) {
  const targetAmount = toNumber(goal.target_amount);
  const currentAmount = toNumber(goal.current_amount);
  const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const remainingAmount = targetAmount - currentAmount;
  const deadline = goal.deadline ? goal.deadline.toISOString() : null;
  const daysRemaining = getDaysRemaining(goal.deadline);
  const suggestedMonthlyContribution = goal.status === 'ACTIVE'
    ? getSuggestedMonthlyContribution(targetAmount, currentAmount, goal.deadline)
    : null;

  return {
    id: goal.id,
    name: goal.name,
    description: goal.description,
    targetAmount,
    currentAmount,
    deadline,
    status: goal.status,
    progressPercentage: Number(progressPercentage.toFixed(2)),
    remainingAmount: Number(remainingAmount.toFixed(2)),
    suggestedMonthlyContribution,
    daysRemaining,
    createdAt: goal.created_at.toISOString(),
    updatedAt: goal.updated_at.toISOString()
  };
}

function buildListWhere(tenantId, filters = {}) {
  const where = {
    tenant_id: tenantId,
    deleted_at: null
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      {
        name: {
          contains: filters.search,
          mode: 'insensitive'
        }
      },
      {
        description: {
          contains: filters.search,
          mode: 'insensitive'
        }
      }
    ];
  }

  return where;
}

async function findGoalByTenant(goalId, tenantId) {
  return prisma.goal.findFirst({
    where: {
      id: goalId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });
}

async function listGoals(tenantId, filters = {}) {
  const where = buildListWhere(tenantId, filters);

  const goals = await prisma.goal.findMany({
    where,
    orderBy: [
      { status: 'asc' },
      { deadline: 'asc' }
    ]
  });

  return goals.map(enrichGoalResponse);
}

async function getGoalById(goalId, tenantId) {
  const goal = await findGoalByTenant(goalId, tenantId);

  if (!goal) {
    throw new AppError('Meta nao encontrada', 404);
  }

  return enrichGoalResponse(goal);
}

async function createGoal(data, tenantId, userId) {
  const currentAmount = data.currentAmount ?? 0;
  let status = data.status ?? 'ACTIVE';

  if (currentAmount >= data.targetAmount) {
    status = 'COMPLETED';
  }

  const goal = await prisma.goal.create({
    data: {
      tenant_id: tenantId,
      user_id: userId,
      name: data.name,
      description: data.description ?? null,
      target_amount: toDecimalString(data.targetAmount),
      current_amount: toDecimalString(currentAmount),
      deadline: data.deadline ?? null,
      status
    }
  });

  return enrichGoalResponse(goal);
}

async function updateGoal(goalId, tenantId, data) {
  const existingGoal = await findGoalByTenant(goalId, tenantId);

  if (!existingGoal) {
    throw new AppError('Meta nao encontrada', 404);
  }

  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.targetAmount !== undefined) {
    updateData.target_amount = toDecimalString(data.targetAmount);
  }

  if (data.currentAmount !== undefined) {
    updateData.current_amount = toDecimalString(data.currentAmount);
  }

  if (data.deadline !== undefined) {
    updateData.deadline = data.deadline ?? null;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  const goal = await prisma.goal.update({
    where: {
      id: existingGoal.id
    },
    data: updateData
  });

  return enrichGoalResponse(goal);
}

async function updateGoalProgress(goalId, tenantId, data) {
  const existingGoal = await findGoalByTenant(goalId, tenantId);

  if (!existingGoal) {
    throw new AppError('Meta nao encontrada', 404);
  }

  const targetAmount = toNumber(existingGoal.target_amount);
  const currentAmount = data.currentAmount;
  let status = existingGoal.status;

  if (currentAmount >= targetAmount) {
    status = 'COMPLETED';
  } else if (status === 'COMPLETED') {
    status = 'ACTIVE';
  }

  const goal = await prisma.goal.update({
    where: {
      id: existingGoal.id
    },
    data: {
      current_amount: toDecimalString(currentAmount),
      status
    }
  });

  return enrichGoalResponse(goal);
}

async function deleteGoal(goalId, tenantId) {
  const existingGoal = await findGoalByTenant(goalId, tenantId);

  if (!existingGoal) {
    throw new AppError('Meta nao encontrada', 404);
  }

  await prisma.goal.update({
    where: {
      id: existingGoal.id
    },
    data: {
      deleted_at: new Date()
    }
  });

  return {
    message: 'Meta excluida com sucesso'
  };
}

async function getGoalsSummary(tenantId) {
  const goals = await prisma.goal.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null
    }
  });

  const totalGoals = goals.length;
  const activeGoals = goals.filter((goal) => goal.status === 'ACTIVE').length;
  const completedGoals = goals.filter((goal) => goal.status === 'COMPLETED').length;
  const canceledGoals = goals.filter((goal) => goal.status === 'CANCELED').length;

  const totalTargetAmount = goals.reduce((sum, goal) => sum + toNumber(goal.target_amount), 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + toNumber(goal.current_amount), 0);

  const overallProgressPercentage = totalTargetAmount > 0
    ? Number(((totalCurrentAmount / totalTargetAmount) * 100).toFixed(2))
    : 0;

  return {
    totalGoals,
    activeGoals,
    completedGoals,
    canceledGoals,
    totalTargetAmount: Number(totalTargetAmount.toFixed(2)),
    totalCurrentAmount: Number(totalCurrentAmount.toFixed(2)),
    overallProgressPercentage
  };
}

module.exports = {
  listGoals,
  getGoalById,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  getGoalsSummary
};
