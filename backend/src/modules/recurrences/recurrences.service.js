const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

function toDecimalString(value) {
  return Number(value || 0).toFixed(2);
}

function toNumber(value) {
  return Number(value || 0);
}

function toISOString(date) {
  if (!date) return null;
  return new Date(date).toISOString();
}

function getStartOfDay(date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function getRecurrenceInclude() {
  return {
    account: {
      select: { id: true, name: true }
    },
    creditCard: {
      select: { id: true, name: true }
    },
    category: {
      select: { id: true, name: true, type: true }
    }
  };
}

function getTransactionInclude() {
  return {
    category: {
      select: { id: true, name: true, type: true }
    },
    account: {
      select: { id: true, name: true }
    },
    credit_card: {
      select: { id: true, name: true }
    }
  };
}

function toRecurrenceResponse(recurrence) {
  return {
    id: recurrence.id,
    description: recurrence.description,
    type: recurrence.type,
    amount: toNumber(recurrence.amount),
    frequency: recurrence.frequency,
    status: recurrence.status,
    startDate: toISOString(recurrence.startDate),
    endDate: toISOString(recurrence.endDate),
    nextRunDate: toISOString(recurrence.nextRunDate),
    lastRunDate: toISOString(recurrence.lastRunDate),
    paymentMethod: recurrence.paymentMethod,
    notes: recurrence.notes,
    autoGenerate: recurrence.autoGenerate,
    generateAsPaid: recurrence.generateAsPaid,
    account: recurrence.account ? {
      id: recurrence.account.id,
      name: recurrence.account.name
    } : null,
    creditCard: recurrence.creditCard ? {
      id: recurrence.creditCard.id,
      name: recurrence.creditCard.name
    } : null,
    category: recurrence.category ? {
      id: recurrence.category.id,
      name: recurrence.category.name,
      type: recurrence.category.type
    } : null,
    createdAt: toISOString(recurrence.createdAt),
    updatedAt: toISOString(recurrence.updatedAt)
  };
}

function toTransactionResponse(transaction) {
  return {
    id: transaction.id,
    description: transaction.description,
    amount: toNumber(transaction.amount),
    type: transaction.type,
    status: transaction.status,
    transactionDate: transaction.transaction_date.toISOString(),
    paymentMethod: transaction.payment_method,
    source: transaction.source,
    notes: transaction.notes,
    recurrenceId: transaction.recurrence_id,
    category: transaction.category ? {
      id: transaction.category.id,
      name: transaction.category.name,
      type: transaction.category.type
    } : null,
    account: transaction.account ? {
      id: transaction.account.id,
      name: transaction.account.name
    } : null,
    creditCard: transaction.credit_card ? {
      id: transaction.credit_card.id,
      name: transaction.credit_card.name
    } : null,
    createdAt: transaction.created_at.toISOString(),
    updatedAt: transaction.updated_at.toISOString()
  };
}

function calculateNextRunDate(currentDate, frequency) {
  const date = new Date(currentDate);
  const currentDay = date.getDate();

  switch (frequency) {
    case 'DAILY':
      date.setDate(date.getDate() + 1);
      break;
    case 'WEEKLY':
      date.setDate(date.getDate() + 7);
      break;
    case 'BIWEEKLY':
      date.setDate(date.getDate() + 14);
      break;
    case 'MONTHLY': {
      const targetMonth = date.getMonth() + 1;
      date.setMonth(targetMonth);
      if (date.getDate() !== currentDay && date.getMonth() !== (targetMonth % 12)) {
        date.setDate(0);
      }
      break;
    }
    case 'BIMONTHLY': {
      const targetMonth = date.getMonth() + 2;
      date.setMonth(targetMonth);
      if (date.getDate() !== currentDay && date.getMonth() !== (targetMonth % 12)) {
        date.setDate(0);
      }
      break;
    }
    case 'QUARTERLY': {
      const targetMonth = date.getMonth() + 3;
      date.setMonth(targetMonth);
      if (date.getDate() !== currentDay && date.getMonth() !== (targetMonth % 12)) {
        date.setDate(0);
      }
      break;
    }
    case 'SEMIANNUAL': {
      const targetMonth = date.getMonth() + 6;
      date.setMonth(targetMonth);
      if (date.getDate() !== currentDay && date.getMonth() !== (targetMonth % 12)) {
        date.setDate(0);
      }
      break;
    }
    case 'YEARLY': {
      const targetYear = date.getFullYear() + 1;
      date.setFullYear(targetYear);
      break;
    }
    default:
      throw new AppError('Frequencia invalida', 400);
  }

  return date;
}

async function findRecurrenceByTenant(recurrenceId, tenantId) {
  return prisma.recurrence.findFirst({
    where: {
      id: recurrenceId,
      tenantId: tenantId,
      deletedAt: null
    },
    include: getRecurrenceInclude()
  });
}

async function findAccountByTenant(accountId, tenantId) {
  if (!accountId) return null;

  return prisma.account.findFirst({
    where: {
      id: accountId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });
}

async function findCreditCardByTenant(creditCardId, tenantId) {
  if (!creditCardId) return null;

  return prisma.creditCard.findFirst({
    where: {
      id: creditCardId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });
}

async function findCategoryByTenant(categoryId, tenantId) {
  if (!categoryId) return null;

  return prisma.category.findFirst({
    where: {
      id: categoryId,
      deleted_at: null,
      OR: [
        { tenant_id: null, is_default: true },
        { tenant_id: tenantId }
      ]
    }
  });
}

async function validateRelations(data, tenantId) {
  const accountId = data.accountId === undefined ? undefined : (data.accountId || null);
  const creditCardId = data.creditCardId === undefined ? undefined : (data.creditCardId || null);
  const categoryId = data.categoryId === undefined ? undefined : (data.categoryId || null);

  const [account, creditCard, category] = await Promise.all([
    accountId ? findAccountByTenant(accountId, tenantId) : Promise.resolve(null),
    creditCardId ? findCreditCardByTenant(creditCardId, tenantId) : Promise.resolve(null),
    categoryId ? findCategoryByTenant(categoryId, tenantId) : Promise.resolve(null)
  ]);

  if (accountId && !account) {
    throw new AppError('Conta nao encontrada para o tenant atual', 404);
  }

  if (creditCardId && !creditCard) {
    throw new AppError('Cartao de credito nao encontrado para o tenant atual', 404);
  }

  if (categoryId && !category) {
    throw new AppError('Categoria nao encontrada para o tenant atual', 404);
  }

  if (category && data.type && category.type !== data.type) {
    throw new AppError('Categoria deve ser compativel com o tipo da recorrencia', 400);
  }

  if (data.creditCardId && data.type === 'INCOME') {
    throw new AppError('Nao e possivel associar cartao de credito a uma receita', 400);
  }
}

function buildListWhere(tenantId, filters) {
  const where = {
    tenantId,
    deletedAt: null
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.frequency) {
    where.frequency = filters.frequency;
  }

  if (filters.from || filters.to) {
    where.nextRunDate = {};

    if (filters.from) {
      where.nextRunDate.gte = getStartOfDay(filters.from);
    }

    if (filters.to) {
      where.nextRunDate.lte = getStartOfDay(filters.to);
    }
  }

  if (filters.search) {
    where.OR = [
      { description: { contains: filters.search, mode: 'insensitive' } },
      { notes: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  return where;
}

async function listRecurrences(tenantId, filters) {
  const where = buildListWhere(tenantId, filters);

  const recurrences = await prisma.recurrence.findMany({
    where,
    include: getRecurrenceInclude(),
    orderBy: [
      { nextRunDate: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  return recurrences.map(toRecurrenceResponse);
}

async function getRecurrenceById(recurrenceId, tenantId) {
  const recurrence = await findRecurrenceByTenant(recurrenceId, tenantId);

  if (!recurrence) {
    throw new AppError('Recorrencia nao encontrada', 404);
  }

  return toRecurrenceResponse(recurrence);
}

async function createRecurrence(data, tenantId, userId) {
  await validateRelations(data, tenantId);

  const recurrence = await prisma.recurrence.create({
    data: {
      tenantId,
      accountId: data.accountId || null,
      creditCardId: data.creditCardId || null,
      categoryId: data.categoryId || null,
      description: data.description,
      type: data.type,
      amount: toDecimalString(data.amount),
      frequency: data.frequency,
      status: 'ACTIVE',
      startDate: data.startDate,
      endDate: data.endDate || null,
      nextRunDate: data.nextRunDate,
      paymentMethod: data.paymentMethod || null,
      notes: data.notes || null,
      autoGenerate: data.autoGenerate || false,
      generateAsPaid: data.generateAsPaid || false,
      createdById: userId
    },
    include: getRecurrenceInclude()
  });

  return toRecurrenceResponse(recurrence);
}

async function updateRecurrence(recurrenceId, tenantId, data) {
  const existing = await findRecurrenceByTenant(recurrenceId, tenantId);

  if (!existing) {
    throw new AppError('Recorrencia nao encontrada', 404);
  }

  const mergedData = {
    description: data.description ?? existing.description,
    type: data.type ?? existing.type,
    amount: data.amount !== undefined ? data.amount : toNumber(existing.amount),
    frequency: data.frequency ?? existing.frequency,
    startDate: data.startDate ?? existing.startDate,
    nextRunDate: data.nextRunDate ?? existing.nextRunDate,
    endDate: data.endDate !== undefined ? (data.endDate || null) : existing.endDate,
    accountId: data.accountId !== undefined ? (data.accountId || null) : existing.accountId,
    creditCardId: data.creditCardId !== undefined ? (data.creditCardId || null) : existing.creditCardId,
    categoryId: data.categoryId !== undefined ? (data.categoryId || null) : existing.categoryId,
    paymentMethod: data.paymentMethod !== undefined ? (data.paymentMethod || null) : existing.paymentMethod,
    notes: data.notes !== undefined ? data.notes : existing.notes,
    autoGenerate: data.autoGenerate ?? existing.autoGenerate,
    generateAsPaid: data.generateAsPaid ?? existing.generateAsPaid
  };

  await validateRelations(mergedData, tenantId);

  const updateData = {};

  if (data.description !== undefined) updateData.description = data.description;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.amount !== undefined) updateData.amount = toDecimalString(data.amount);
  if (data.frequency !== undefined) updateData.frequency = data.frequency;
  if (data.startDate !== undefined) updateData.startDate = data.startDate;
  if (data.nextRunDate !== undefined) updateData.nextRunDate = data.nextRunDate;
  if (data.endDate !== undefined) updateData.endDate = data.endDate || null;
  if (data.accountId !== undefined) updateData.accountId = data.accountId || null;
  if (data.creditCardId !== undefined) updateData.creditCardId = data.creditCardId || null;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
  if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod || null;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.autoGenerate !== undefined) updateData.autoGenerate = data.autoGenerate;
  if (data.generateAsPaid !== undefined) updateData.generateAsPaid = data.generateAsPaid;

  const recurrence = await prisma.recurrence.update({
    where: { id: existing.id },
    data: updateData,
    include: getRecurrenceInclude()
  });

  return toRecurrenceResponse(recurrence);
}

async function updateRecurrenceStatus(recurrenceId, tenantId, status) {
  const existing = await findRecurrenceByTenant(recurrenceId, tenantId);

  if (!existing) {
    throw new AppError('Recorrencia nao encontrada', 404);
  }

  const recurrence = await prisma.recurrence.update({
    where: { id: existing.id },
    data: { status },
    include: getRecurrenceInclude()
  });

  return toRecurrenceResponse(recurrence);
}

async function deleteRecurrence(recurrenceId, tenantId) {
  const existing = await findRecurrenceByTenant(recurrenceId, tenantId);

  if (!existing) {
    throw new AppError('Recorrencia nao encontrada', 404);
  }

  await prisma.recurrence.update({
    where: { id: existing.id },
    data: { deletedAt: new Date() }
  });

  return { message: 'Recorrencia excluida com sucesso' };
}

async function generateTransaction(recurrenceId, tenantId, userId) {
  const existing = await findRecurrenceByTenant(recurrenceId, tenantId);

  if (!existing) {
    throw new AppError('Recorrencia nao encontrada', 404);
  }

  if (existing.status !== 'ACTIVE') {
    throw new AppError('Apenas recorrencias ativas podem gerar lancamentos', 400);
  }

  if (existing.endDate && existing.nextRunDate > existing.endDate) {
    throw new AppError('A data da proxima geracao ultrapassa a data final da recorrencia', 400);
  }

  const nextRunDate = new Date(existing.nextRunDate);
  nextRunDate.setHours(0, 0, 0, 0);
  const nextRunEnd = new Date(nextRunDate);
  nextRunEnd.setHours(23, 59, 59, 999);

  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      recurrence_id: existing.id,
      tenant_id: tenantId,
      deleted_at: null,
      transaction_date: {
        gte: nextRunDate,
        lte: nextRunEnd
      }
    }
  });

  if (existingTransaction) {
    throw new AppError('Esta recorrencia ja gerou lancamento para este periodo', 400);
  }

  const transaction = await prisma.transaction.create({
    data: {
      tenant_id: tenantId,
      user_id: userId,
      account_id: existing.accountId || null,
      credit_card_id: existing.creditCardId || null,
      category_id: existing.categoryId || null,
      description: existing.description,
      amount: existing.amount,
      type: existing.type,
      status: existing.generateAsPaid ? 'CONFIRMED' : 'PENDING',
      transaction_date: existing.nextRunDate,
      payment_method: existing.paymentMethod || 'OTHER',
      notes: existing.notes || null,
      source: 'RECURRENCE',
      recurrence_id: existing.id
    },
    include: getTransactionInclude()
  });

  const nextRun = calculateNextRunDate(existing.nextRunDate, existing.frequency);

  const updateData = {
    lastRunDate: existing.nextRunDate,
    nextRunDate: nextRun
  };

  if (existing.endDate && nextRun > existing.endDate) {
    updateData.status = 'FINISHED';
  }

  const updated = await prisma.recurrence.update({
    where: { id: existing.id },
    data: updateData,
    include: getRecurrenceInclude()
  });

  return {
    transaction: toTransactionResponse(transaction),
    recurrence: toRecurrenceResponse(updated)
  };
}

module.exports = {
  listRecurrences,
  getRecurrenceById,
  createRecurrence,
  updateRecurrence,
  updateRecurrenceStatus,
  deleteRecurrence,
  generateTransaction,
  calculateNextRunDate
};
