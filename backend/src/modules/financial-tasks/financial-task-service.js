const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

function normalizeTaskStatus(status) {
  return status === 'COMPLETED' ? 'COMPLETED' : 'PENDING';
}

function buildListWhere(tenantId, filters = {}) {
  const where = {
    tenantId,
    deletedAt: null
  };

  if (filters.status === 'COMPLETED') {
    where.status = 'COMPLETED';
  } else if (filters.status === 'PENDING') {
    where.status = { not: 'COMPLETED' };
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  const dueDateConditions = {};

  if (filters.dueDate) {
    dueDateConditions.lte = filters.dueDate;
  }

  if (filters.overdue === 'true') {
    dueDateConditions.lt = new Date();
    where.status = { not: 'COMPLETED' };
  }

  if (filters.dueDateGte) {
    dueDateConditions.gte = new Date(filters.dueDateGte);
  }

  if (filters.dueDateLte) {
    dueDateConditions.lte = new Date(filters.dueDateLte);
  }

  if (Object.keys(dueDateConditions).length > 0) {
    where.dueDate = dueDateConditions;
  }

  if (filters.search) {
    where.OR = [
      {
        title: {
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

async function findTaskByTenant(taskId, tenantId) {
  return prisma.financialTask.findFirst({
    where: {
      id: taskId,
      tenantId,
      deletedAt: null
    }
  });
}

function enrichTaskResponse(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: normalizeTaskStatus(task.status),
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
}

async function listTasks(tenantId, filters = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where = buildListWhere(tenantId, filters);

  const [tasks, total] = await Promise.all([
    prisma.financialTask.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { dueDate: { sort: 'asc', nulls: 'last' } }
      ],
      skip,
      take: limit
    }),
    prisma.financialTask.count({ where })
  ]);

  return {
    data: tasks.map(enrichTaskResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function getTaskById(taskId, tenantId) {
  const task = await findTaskByTenant(taskId, tenantId);

  if (!task) {
    throw new AppError('Tarefa nao encontrada', 404);
  }

  return enrichTaskResponse(task);
}

async function createTask(data, tenantId) {
  const task = await prisma.financialTask.create({
    data: {
      tenantId,
      title: data.title,
      description: data.description ?? null,
      priority: data.priority ?? 'MEDIUM',
      status: data.status ?? 'PENDING',
      dueDate: data.dueDate ?? null,
      completedAt: data.status === 'COMPLETED' ? new Date() : null
    }
  });

  return enrichTaskResponse(task);
}

async function updateTask(taskId, tenantId, data) {
  const existingTask = await findTaskByTenant(taskId, tenantId);

  if (!existingTask) {
    throw new AppError('Tarefa nao encontrada', 404);
  }

  const updateData = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.description !== undefined) {
    updateData.description = data.description ?? null;
  }

  if (data.priority !== undefined) {
    updateData.priority = data.priority;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;

    if (data.status === 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (existingTask.status === 'COMPLETED' && data.status !== 'COMPLETED') {
      updateData.completedAt = null;
    }
  }

  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ?? null;
  }

  const task = await prisma.financialTask.update({
    where: {
      id: existingTask.id
    },
    data: updateData
  });

  return enrichTaskResponse(task);
}

async function completeTask(taskId, tenantId) {
  const existingTask = await findTaskByTenant(taskId, tenantId);

  if (!existingTask) {
    throw new AppError('Tarefa nao encontrada', 404);
  }

  const task = await prisma.financialTask.update({
    where: {
      id: existingTask.id
    },
    data: {
      status: 'COMPLETED',
      completedAt: new Date()
    }
  });

  return enrichTaskResponse(task);
}

async function deleteTask(taskId, tenantId) {
  const existingTask = await findTaskByTenant(taskId, tenantId);

  if (!existingTask) {
    throw new AppError('Tarefa nao encontrada', 404);
  }

  await prisma.financialTask.update({
    where: {
      id: existingTask.id
    },
    data: {
      deletedAt: new Date()
    }
  });

  return { message: 'Tarefa excluida com sucesso' };
}

async function getDashboardSummary(tenantId) {
  const now = new Date();

  const tasks = await prisma.financialTask.findMany({
    where: {
      tenantId,
      deletedAt: null
    },
    orderBy: [
      { status: 'asc' },
      { priority: 'desc' },
      { dueDate: { sort: 'asc', nulls: 'last' } }
    ]
  });

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const pending = tasks.filter((t) => normalizeTaskStatus(t.status) !== 'COMPLETED').length;
  const overdue = tasks.filter(
    (t) => normalizeTaskStatus(t.status) !== 'COMPLETED' && t.dueDate && t.dueDate < now
  ).length;
  const today = tasks.filter(
    (t) => normalizeTaskStatus(t.status) !== 'COMPLETED' && t.dueDate && t.dueDate >= startOfToday && t.dueDate <= endOfToday
  ).length;
  const completed = tasks.filter((t) => normalizeTaskStatus(t.status) === 'COMPLETED').length;

  const nextTasks = tasks
    .filter((t) => normalizeTaskStatus(t.status) !== 'COMPLETED')
    .slice(0, 5)
    .map(enrichTaskResponse);

  return {
    pending,
    overdue,
    today,
    completed,
    nextTasks
  };
}

module.exports = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  getDashboardSummary
};
