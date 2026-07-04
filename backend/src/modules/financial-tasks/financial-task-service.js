const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

function toNumber(value) {
  return Number(value || 0);
}

function buildListWhere(tenantId, filters = {}) {
  const where = {
    tenantId,
    deletedAt: null
  };

  if (filters.status) {
    where.status = filters.status;
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
    where.status = { notIn: ['COMPLETED', 'CANCELLED'] };
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
    include: {
      account: {
        select: {
          id: true,
          name: true
        }
      },
      items: {
        orderBy: { order: 'asc' }
      }
    }
  });
}

function enrichTaskResponse(task) {
  const items = task.items || [];
  const totalItems = items.length;
  const completedItems = items.filter((i) => i.completed).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : null;

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    estimatedAmount: task.estimatedAmount ? toNumber(task.estimatedAmount) : null,
    accountId: task.accountId,
    accountName: task.account?.name || null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    reminderAt: task.reminderAt ? task.reminderAt.toISOString() : null,
    notificationSent: task.notificationSent,
    autoComplete: task.autoComplete,
    generatedTransactionId: task.generatedTransactionId || null,
    items: items.map((item) => ({
      id: item.id,
      description: item.description,
      completed: item.completed,
      order: item.order,
      createdAt: item.createdAt.toISOString()
    })),
    totalItems,
    completedItems,
    progress,
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
    include: {
      account: {
        select: {
          id: true,
          name: true
        }
      },
      items: {
        orderBy: { order: 'asc' }
      }
    },
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
  const items = (data.items || []).map((item, index) => ({
    description: item.description,
    completed: item.completed ?? false,
    order: item.order ?? index
  }));

  const task = await prisma.financialTask.create({
    data: {
      tenantId,
      title: data.title,
      description: data.description ?? null,
      priority: data.priority ?? 'MEDIUM',
      status: data.status ?? 'PENDING',
      dueDate: data.dueDate ?? null,
      estimatedAmount: data.estimatedAmount !== undefined ? String(data.estimatedAmount) : null,
      accountId: data.accountId ?? null,
      reminderAt: data.reminderAt ?? null,
      autoComplete: data.autoComplete ?? false,
      items: items.length > 0 ? { create: items } : undefined
    },
    include: {
      account: {
        select: {
          id: true,
          name: true
        }
      },
      items: {
        orderBy: { order: 'asc' }
      }
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

  if (data.estimatedAmount !== undefined) {
    updateData.estimatedAmount = data.estimatedAmount !== null ? String(data.estimatedAmount) : null;
  }

  if (data.accountId !== undefined) {
    updateData.accountId = data.accountId ?? null;
  }

  if (data.autoComplete !== undefined) {
    updateData.autoComplete = data.autoComplete;
  }

  if (data.reminderAt !== undefined) {
    updateData.reminderAt = data.reminderAt ?? null;

    if (data.reminderAt === null) {
      updateData.notificationSent = false;
    }
  }

  const task = await prisma.financialTask.update({
    where: {
      id: existingTask.id
    },
    data: updateData,
    include: {
      account: {
        select: {
          id: true,
          name: true
        }
      },
      items: {
        orderBy: { order: 'asc' }
      }
    }
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
    include: {
      account: {
        select: {
          id: true,
          name: true
        }
      },
      items: {
        orderBy: { order: 'asc' }
      }
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

async function generateTransaction(taskId, tenantId, data) {
  const task = await findTaskByTenant(taskId, tenantId);

  if (!task) {
    throw new AppError('Tarefa nao encontrada', 404);
  }

  if (task.status !== 'COMPLETED') {
    throw new AppError('Apenas tarefas concluidas podem gerar transacoes', 400);
  }

  if (task.generatedTransactionId) {
    throw new AppError('Transacao ja gerada para esta tarefa', 400);
  }

  const transaction = await prisma.transaction.create({
    data: {
      tenant_id: tenantId,
      user_id: null,
      account_id: data.accountId,
      category_id: data.categoryId || null,
      description: data.description || task.title,
      notes: task.description || null,
      amount: String(data.amount),
      type: data.type,
      status: 'CONFIRMED',
      transaction_date: data.transactionDate || new Date(),
      payment_method: data.type === 'EXPENSE' ? 'PIX' : 'TRANSFER',
      source: 'MANUAL'
    }
  });

  await prisma.financialTask.update({
    where: { id: task.id },
    data: { generatedTransactionId: transaction.id }
  });

  return {
    transactionId: transaction.id,
    taskId: task.id
  };
}

async function createItem(taskId, tenantId, data) {
  const task = await findTaskByTenant(taskId, tenantId);

  if (!task) {
    throw new AppError('Tarefa nao encontrada', 404);
  }

  const maxOrder = task.items.reduce((max, i) => Math.max(max, i.order), -1);

  const item = await prisma.financialTaskItem.create({
    data: {
      taskId: task.id,
      description: data.description,
      order: maxOrder + 1
    }
  });

  return {
    id: item.id,
    description: item.description,
    completed: item.completed,
    order: item.order,
    createdAt: item.createdAt.toISOString()
  };
}

async function updateItem(taskId, tenantId, itemId, data) {
  const task = await findTaskByTenant(taskId, tenantId);

  if (!task) {
    throw new AppError('Tarefa nao encontrada', 404);
  }

  const existingItem = await prisma.financialTaskItem.findFirst({
    where: { id: itemId, taskId: task.id }
  });

  if (!existingItem) {
    throw new AppError('Item nao encontrado', 404);
  }

  const updateData = {};

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.completed !== undefined) {
    updateData.completed = data.completed;
  }

  if (data.order !== undefined) {
    updateData.order = data.order;
  }

  const item = await prisma.financialTaskItem.update({
    where: { id: itemId },
    data: updateData
  });

  if (data.completed === true && task.autoComplete) {
    const allItems = await prisma.financialTaskItem.findMany({
      where: { taskId: task.id }
    });

    const allCompleted = allItems.every((i) =>
      i.id === itemId ? data.completed : i.completed
    );

    if (allCompleted) {
      await prisma.financialTask.update({
        where: { id: task.id },
        data: { status: 'COMPLETED', completedAt: new Date() }
      });
    }
  }

  return {
    id: item.id,
    description: item.description,
    completed: item.completed,
    order: item.order,
    createdAt: item.createdAt.toISOString()
  };
}

async function deleteItem(taskId, tenantId, itemId) {
  const task = await findTaskByTenant(taskId, tenantId);

  if (!task) {
    throw new AppError('Tarefa nao encontrada', 404);
  }

  const existingItem = await prisma.financialTaskItem.findFirst({
    where: { id: itemId, taskId: task.id }
  });

  if (!existingItem) {
    throw new AppError('Item nao encontrado', 404);
  }

  await prisma.financialTaskItem.delete({
    where: { id: itemId }
  });

  return { message: 'Item excluido com sucesso' };
}

async function reorderItems(taskId, tenantId, data) {
  const task = await findTaskByTenant(taskId, tenantId);

  if (!task) {
    throw new AppError('Tarefa nao encontrada', 404);
  }

  const updates = data.items.map((item) =>
    prisma.financialTaskItem.update({
      where: { id: item.id },
      data: { order: item.order }
    })
  );

  await prisma.$transaction(updates);

  return { message: 'Itens reordenados com sucesso' };
}

async function getDashboardSummary(tenantId) {
  const now = new Date();

  const tasks = await prisma.financialTask.findMany({
    where: {
      tenantId,
      deletedAt: null
    },
    include: {
      account: {
        select: {
          id: true,
          name: true
        }
      },
      items: {
        orderBy: { order: 'asc' }
      }
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

  const pending = tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
  const overdue = tasks.filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.dueDate && t.dueDate < now
  ).length;
  const today = tasks.filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.dueDate && t.dueDate >= startOfToday && t.dueDate <= endOfToday
  ).length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;

  const nextTasks = tasks
    .filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED')
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
  generateTransaction,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
  getDashboardSummary
};
