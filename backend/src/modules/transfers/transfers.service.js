const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const { formatDateOnly } = require('../../utils/date-utils');

function toDecimalString(value) {
  return Number(value || 0).toFixed(2);
}

function toNumber(value) {
  return Number(value || 0);
}

function getStartOfDay(date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function getEndOfDay(date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(23, 59, 59, 999);
  return normalizedDate;
}

function getMonthRange(month, year) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

function getTransferInclude() {
  return {
    account: {
      select: {
        id: true,
        name: true
      }
    }
  };
}

function toTransferResponse(transfer) {
  return {
    id: transfer.id,
    transferId: transfer.transfer_id,
    description: transfer.description,
    amount: toNumber(transfer.amount),
    type: transfer.type,
    status: transfer.status,
    transactionDate: formatDateOnly(transfer.transaction_date),
    notes: transfer.notes,
    account: transfer.account ? {
      id: transfer.account.id,
      name: transfer.account.name
    } : null,
    createdAt: transfer.created_at.toISOString(),
    updatedAt: transfer.updated_at.toISOString()
  };
}

async function findAccountByTenant(accountId, tenantId) {
  return prisma.account.findFirst({
    where: {
      id: accountId,
      tenant_id: tenantId,
      is_active: true,
      deleted_at: null
    }
  });
}

async function findTransactionByTenant(transactionId, tenantId) {
  return prisma.transaction.findFirst({
    where: {
      id: transactionId,
      tenant_id: tenantId,
      deleted_at: null
    },
    include: getTransferInclude()
  });
}

async function createTransfer(data, tenantId, userId) {
  const [fromAccount, toAccount] = await Promise.all([
    findAccountByTenant(data.fromAccountId, tenantId),
    findAccountByTenant(data.toAccountId, tenantId)
  ]);

  if (!fromAccount) {
    throw new AppError('Conta de origem nao encontrada ou inativa', 404);
  }

  if (!toAccount) {
    throw new AppError('Conta de destino nao encontrada ou inativa', 404);
  }

  if (data.fromAccountId === data.toAccountId) {
    throw new AppError('Conta de origem e destino devem ser diferentes', 400);
  }

  const transferId = require('crypto').randomUUID();
  const amount = toDecimalString(data.amount);
  const negativeAmount = toDecimalString(-data.amount);
  const transactionDate = data.transactionDate;
  const description = data.description.trim();
  const notes = data.notes ?? null;

  const result = await prisma.$transaction(async (tx) => {
    const outgoingTransaction = await tx.transaction.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        account_id: data.fromAccountId,
        category_id: null,
        description: `Transferencia para "${toAccount.name}"`,
        amount: negativeAmount,
        type: 'TRANSFER',
        status: 'CONFIRMED',
        transaction_date: transactionDate,
        payment_method: 'TRANSFER',
        notes,
        source: 'MANUAL',
        is_recurring: false,
        is_installment: false,
        transfer_id: transferId
      },
      include: getTransferInclude()
    });

    const incomingTransaction = await tx.transaction.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        account_id: data.toAccountId,
        category_id: null,
        description: `Transferencia recebida de "${fromAccount.name}"`,
        amount,
        type: 'TRANSFER',
        status: 'CONFIRMED',
        transaction_date: transactionDate,
        payment_method: 'TRANSFER',
        notes,
        source: 'MANUAL',
        is_recurring: false,
        is_installment: false,
        transfer_id: transferId
      },
      include: getTransferInclude()
    });

    return { outgoingTransaction, incomingTransaction };
  });

  return {
    transferId,
    outgoing: toTransferResponse(result.outgoingTransaction),
    incoming: toTransferResponse(result.incomingTransaction)
  };
}

async function getTransferById(transferId, tenantId) {
  const transactions = await prisma.transaction.findMany({
    where: {
      transfer_id: transferId,
      tenant_id: tenantId,
      deleted_at: null
    },
    include: getTransferInclude(),
    orderBy: { created_at: 'asc' }
  });

  if (transactions.length === 0) {
    throw new AppError('Transferencia nao encontrada', 404);
  }

  const outgoing = transactions.find((t) => toNumber(t.amount) < 0) || transactions[0];
  const incoming = transactions.find((t) => toNumber(t.amount) >= 0 && t.id !== outgoing.id) || transactions[1];

  return {
    transferId,
    description: outgoing.description.replace(/^Transferencia para "/, '').replace(/"$/, ''),
    amount: Math.abs(toNumber(outgoing.amount)),
    transactionDate: formatDateOnly(outgoing.transaction_date),
    notes: outgoing.notes,
    fromAccount: outgoing.account ? { id: outgoing.account.id, name: outgoing.account.name } : null,
    toAccount: incoming?.account ? { id: incoming.account.id, name: incoming.account.name } : null,
    outgoing: toTransferResponse(outgoing),
    incoming: incoming ? toTransferResponse(incoming) : null,
    createdAt: outgoing.created_at.toISOString(),
    updatedAt: outgoing.updated_at.toISOString()
  };
}

async function updateTransfer(transferId, tenantId, data) {
  const existingTransactions = await prisma.transaction.findMany({
    where: {
      transfer_id: transferId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });

  if (existingTransactions.length === 0) {
    throw new AppError('Transferencia nao encontrada', 404);
  }

  const outgoing = existingTransactions.find((t) => toNumber(t.amount) < 0) || existingTransactions[0];
  const incoming = existingTransactions.find((t) => t.id !== outgoing.id);

  let fromAccountId = outgoing.account_id;
  let toAccountId = incoming?.account_id;

  if (data.fromAccountId) {
    const fromAccount = await findAccountByTenant(data.fromAccountId, tenantId);
    if (!fromAccount) {
      throw new AppError('Conta de origem nao encontrada ou inativa', 404);
    }
    fromAccountId = data.fromAccountId;
  }

  if (data.toAccountId) {
    const toAccount = await findAccountByTenant(data.toAccountId, tenantId);
    if (!toAccount) {
      throw new AppError('Conta de destino nao encontrada ou inativa', 404);
    }
    toAccountId = data.toAccountId;
  }

  if (fromAccountId === toAccountId) {
    throw new AppError('Conta de origem e destino devem ser diferentes', 400);
  }

  const newFromAccount = await findAccountByTenant(fromAccountId, tenantId);
  const newToAccount = await findAccountByTenant(toAccountId, tenantId);

  const amount = data.amount !== undefined ? toDecimalString(data.amount) : undefined;
  const transactionDate = data.transactionDate || undefined;
  const description = data.description?.trim() || undefined;
  const notes = data.notes !== undefined ? data.notes : undefined;

  const result = await prisma.$transaction(async (tx) => {
    const outgoingUpdate = {};
    const incomingUpdate = {};

    if (amount !== undefined) {
      outgoingUpdate.amount = toDecimalString(-data.amount);
      incomingUpdate.amount = amount;
    }

    if (transactionDate !== undefined) {
      outgoingUpdate.transaction_date = transactionDate;
      incomingUpdate.transaction_date = transactionDate;
    }

    if (description !== undefined) {
      outgoingUpdate.description = `Transferencia para "${newToAccount.name}"`;
      incomingUpdate.description = `Transferencia recebida de "${newFromAccount.name}"`;
    } else {
      outgoingUpdate.description = `Transferencia para "${newToAccount.name}"`;
      incomingUpdate.description = `Transferencia recebida de "${newFromAccount.name}"`;
    }

    if (data.fromAccountId) {
      outgoingUpdate.account_id = data.fromAccountId;
    }

    if (data.toAccountId) {
      incomingUpdate.account_id = data.toAccountId;
    }

    if (notes !== undefined) {
      outgoingUpdate.notes = notes;
      incomingUpdate.notes = notes;
    }

    const updatedOutgoing = await tx.transaction.update({
      where: { id: outgoing.id },
      data: outgoingUpdate,
      include: getTransferInclude()
    });

    let updatedIncoming = null;

    if (incoming) {
      updatedIncoming = await tx.transaction.update({
        where: { id: incoming.id },
        data: incomingUpdate,
        include: getTransferInclude()
      });
    }

    return { updatedOutgoing, updatedIncoming };
  });

  return {
    transferId,
    outgoing: toTransferResponse(result.updatedOutgoing),
    incoming: result.updatedIncoming ? toTransferResponse(result.updatedIncoming) : null
  };
}

async function deleteTransfer(transferId, tenantId) {
  const existingTransactions = await prisma.transaction.findMany({
    where: {
      transfer_id: transferId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });

  if (existingTransactions.length === 0) {
    throw new AppError('Transferencia nao encontrada', 404);
  }

  await prisma.$transaction(async (tx) => {
    for (const transaction of existingTransactions) {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { deleted_at: new Date() }
      });
    }
  });

  return { message: 'Transferencia excluida com sucesso' };
}

async function listTransfers(tenantId, filters) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;

  const where = {
    tenant_id: tenantId,
    deleted_at: null,
    type: 'TRANSFER'
  };

  if (filters.accountId) {
    const relatedTransferIds = await prisma.transaction.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        type: 'TRANSFER',
        account_id: filters.accountId
      },
      select: { transfer_id: true },
      distinct: ['transfer_id']
    });

    const transferIds = relatedTransferIds
      .map((t) => t.transfer_id)
      .filter(Boolean);

    if (transferIds.length === 0) {
      return { data: [], pagination: { page, limit, total: 0, totalPages: 1 } };
    }

    where.transfer_id = { in: transferIds };
  }

  if (filters.startDate || filters.endDate) {
    where.transaction_date = {};

    if (filters.startDate) {
      where.transaction_date.gte = getStartOfDay(filters.startDate);
    }

    if (filters.endDate) {
      where.transaction_date.lte = getEndOfDay(filters.endDate);
    }
  }

  if (filters.search) {
    where.description = { contains: filters.search, mode: 'insensitive' };
  }

  const allTransactions = await prisma.transaction.findMany({
    where,
    include: {
      account: { select: { id: true, name: true } }
    },
    orderBy: [
      { transaction_date: 'desc' },
      { created_at: 'desc' }
    ]
  });

  const transferMap = new Map();

  for (const tx of allTransactions) {
    const tid = tx.transfer_id;
    if (!transferMap.has(tid)) {
      transferMap.set(tid, {
        outgoing: null,
        incoming: null
      });
    }

    const entry = transferMap.get(tid);

    if (toNumber(tx.amount) < 0) {
      entry.outgoing = tx;
    } else {
      entry.incoming = tx;
    }
  }

  const uniqueTransfers = Array.from(transferMap.values());
  const total = uniqueTransfers.length;
  const skip = (page - 1) * limit;
  const pagedTransfers = uniqueTransfers.slice(skip, skip + limit);

  const data = pagedTransfers.map(({ outgoing, incoming }) => ({
    transferId: outgoing?.transfer_id || incoming?.transfer_id,
    description: outgoing ? outgoing.description.replace(/^Transferencia para "/, '').replace(/"$/, '') : '',
    amount: outgoing ? toNumber(outgoing.amount) * -1 : toNumber(incoming?.amount || 0),
    transactionDate: formatDateOnly(outgoing?.transaction_date || incoming?.transaction_date),
    notes: outgoing?.notes || incoming?.notes || null,
    fromAccount: outgoing?.account ? { id: outgoing.account.id, name: outgoing.account.name } : null,
    toAccount: incoming?.account ? { id: incoming.account.id, name: incoming.account.name } : null,
    createdAt: (outgoing?.created_at || incoming?.created_at).toISOString(),
    updatedAt: (outgoing?.updated_at || incoming?.updated_at).toISOString()
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

module.exports = {
  createTransfer,
  getTransferById,
  updateTransfer,
  deleteTransfer,
  listTransfers
};
