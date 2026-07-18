const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

const taskChecklistInclude = {
  items: {
    where: {
      deletedAt: null
    },
    orderBy: [
      { order: 'asc' },
      { createdAt: 'asc' }
    ]
  }
};

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
    },
    include: taskChecklistInclude
  });
}

function normalizeChecklistPayload(checklist = []) {
  return checklist
    .map((item, index) => ({
      id: item.id ?? null,
      title: item.title.trim(),
      completed: item.completed ?? false,
      order: Number.isInteger(item.order) ? item.order : index
    }))
    .sort((left, right) => left.order - right.order)
    .map((item, index) => ({
      ...item,
      order: index
    }));
}

function buildChecklistMetrics(items = []) {
  const totalChecklistItems = items.length;
  const completedChecklistItems = items.filter((item) => item.completed).length;
  const progress = totalChecklistItems > 0
    ? Number(((completedChecklistItems / totalChecklistItems) * 100).toFixed(2))
    : 0;

  return {
    totalChecklistItems,
    completedChecklistItems,
    progress
  };
}

function serializeChecklistItem(item) {
  return {
    id: item.id,
    title: item.title,
    completed: item.completed,
    order: item.order,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

async function syncTaskChecklist(transactionClient, taskId, existingItems, checklist) {
  const normalizedChecklist = normalizeChecklistPayload(checklist);
  const existingItemsById = new Map(existingItems.map((item) => [item.id, item]));
  const keptItemIds = new Set();
  const operations = [];

  normalizedChecklist.forEach((item) => {
    if (item.id) {
      if (!existingItemsById.has(item.id)) {
        throw new AppError('Item de checklist invalido', 400);
      }

      if (keptItemIds.has(item.id)) {
        throw new AppError('Checklist contem itens duplicados', 400);
      }

      keptItemIds.add(item.id);
      operations.push(
        transactionClient.financialTaskItem.update({
          where: {
            id: item.id
          },
          data: {
            title: item.title,
            completed: item.completed,
            order: item.order,
            deletedAt: null
          }
        })
      );

      return;
    }

    operations.push(
      transactionClient.financialTaskItem.create({
        data: {
          taskId,
          title: item.title,
          completed: item.completed,
          order: item.order
        }
      })
    );
  });

  const removedItemIds = existingItems
    .filter((item) => !keptItemIds.has(item.id))
    .map((item) => item.id);

  if (removedItemIds.length > 0) {
    operations.push(
      transactionClient.financialTaskItem.updateMany({
        where: {
          taskId,
          id: {
            in: removedItemIds
          },
          deletedAt: null
        },
        data: {
          deletedAt: new Date()
        }
      })
    );
  }

  if (operations.length > 0) {
    await Promise.all(operations);
  }
}

function enrichTaskResponse(task) {
  const checklist = (task.items || []).map(serializeChecklistItem);
  const checklistMetrics = buildChecklistMetrics(checklist);

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: normalizeTaskStatus(task.status),
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    checklist,
    totalChecklistItems: checklistMetrics.totalChecklistItems,
    completedChecklistItems: checklistMetrics.completedChecklistItems,
    progress: checklistMetrics.progress,
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
      include: taskChecklistInclude,
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
  const checklist = data.checklist ? normalizeChecklistPayload(data.checklist) : [];

  const task = await prisma.financialTask.create({
    data: {
      tenantId,
      title: data.title,
      description: data.description ?? null,
      priority: data.priority ?? 'MEDIUM',
      status: data.status ?? 'PENDING',
      dueDate: data.dueDate ?? null,
      completedAt: data.status === 'COMPLETED' ? new Date() : null,
      items: checklist.length > 0
        ? {
            create: checklist.map((item) => ({
              title: item.title,
              completed: item.completed,
              order: item.order
            }))
          }
        : undefined
    },
    include: taskChecklistInclude
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

  const task = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.financialTask.update({
      where: {
        id: existingTask.id
      },
      data: updateData
    });

    if (data.checklist !== undefined) {
      await syncTaskChecklist(transactionClient, existingTask.id, existingTask.items || [], data.checklist);
    }

    return transactionClient.financialTask.findUnique({
      where: {
        id: existingTask.id
      },
      include: taskChecklistInclude
    });
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
    },
    include: taskChecklistInclude
  });

  return enrichTaskResponse(task);
}

async function deleteTask(taskId, tenantId) {
  const existingTask = await findTaskByTenant(taskId, tenantId);

  if (!existingTask) {
    throw new AppError('Tarefa nao encontrada', 404);
  }

  const deletedAt = new Date();

  await prisma.$transaction([
    prisma.financialTask.update({
      where: {
        id: existingTask.id
      },
      data: {
        deletedAt
      }
    }),
    prisma.financialTaskItem.updateMany({
      where: {
        taskId: existingTask.id,
        deletedAt: null
      },
      data: {
        deletedAt
      }
    })
  ]);

  return { message: 'Tarefa excluida com sucesso' };
}

async function getDashboardSummary(tenantId) {
  const now = new Date();

  const tasks = await prisma.financialTask.findMany({
    where: {
      tenantId,
      deletedAt: null
    },
    include: taskChecklistInclude,
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
