const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

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

function getTransactionInclude() {
  return {
    category: {
      select: {
        id: true,
        name: true,
        type: true
      }
    },
    account: {
      select: {
        id: true,
        name: true
      }
    },
    credit_card: {
      select: {
        id: true,
        name: true
      }
    }
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
    isRecurring: transaction.is_recurring,
    isInstallment: transaction.is_installment,
    installmentNumber: transaction.installment_number,
    installmentTotal: transaction.installment_total,
    notes: transaction.notes,
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

async function findTransactionByTenant(transactionId, tenantId) {
  return prisma.transaction.findFirst({
    where: {
      id: transactionId,
      tenant_id: tenantId,
      deleted_at: null
    },
    include: getTransactionInclude()
  });
}

async function findAccountByTenant(accountId, tenantId) {
  if (!accountId) {
    return null;
  }

  return prisma.account.findFirst({
    where: {
      id: accountId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });
}

async function findCreditCardByTenant(creditCardId, tenantId) {
  if (!creditCardId) {
    return null;
  }

  return prisma.creditCard.findFirst({
    where: {
      id: creditCardId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });
}

async function findCategoryByTenant(categoryId, tenantId) {
  if (!categoryId) {
    return null;
  }

  return prisma.category.findFirst({
    where: {
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
    }
  });
}

async function validateRelations(data, tenantId) {
  const accountId = data.accountId === undefined ? undefined : (data.accountId || null);
  const creditCardId = data.creditCardId === undefined ? undefined : (data.creditCardId || null);
  const categoryId = data.categoryId === undefined ? undefined : (data.categoryId || null);
  const nextPaymentMethod = data.paymentMethod;
  const nextType = data.type;

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

  if (category && nextType && category.type !== nextType) {
    throw new AppError('Categoria deve ser compativel com o tipo da transacao', 400);
  }

  if (nextType === 'TRANSFER' && categoryId === null) {
    return {
      account,
      creditCard,
      category: null
    };
  }

  if (nextPaymentMethod === 'CREDIT_CARD' && !creditCardId && !accountId) {
    throw new AppError('Informe um cartao de credito ou uma conta para pagamentos no credito', 400);
  }

  if (nextPaymentMethod && nextPaymentMethod !== 'CREDIT_CARD' && !accountId) {
    throw new AppError('Informe uma conta para este metodo de pagamento', 400);
  }

  return {
    account,
    creditCard,
    category
  };
}

function buildListWhere(tenantId, filters) {
  const where = {
    tenant_id: tenantId,
    deleted_at: null
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.accountId) {
    where.account_id = filters.accountId;
  }

  if (filters.creditCardId) {
    where.credit_card_id = filters.creditCardId;
  }

  if (filters.categoryId) {
    where.category_id = filters.categoryId;
  }

  if (filters.source) {
    where.source = filters.source;
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
    where.OR = [
      {
        description: {
          contains: filters.search,
          mode: 'insensitive'
        }
      },
      {
        notes: {
          contains: filters.search,
          mode: 'insensitive'
        }
      }
    ];
  }

  return where;
}

function buildCreateData(data, tenantId, userId) {
  return {
    tenant_id: tenantId,
    user_id: userId,
    account_id: data.accountId || null,
    credit_card_id: data.creditCardId || null,
    category_id: data.categoryId || null,
    description: data.description,
    amount: toDecimalString(data.amount),
    type: data.type,
    status: data.status ?? 'CONFIRMED',
    transaction_date: data.transactionDate,
    payment_method: data.paymentMethod,
    notes: data.notes ?? null,
    source: 'MANUAL',
    is_installment: data.isInstallment ?? false,
    installment_number: data.isInstallment ? (data.installmentNumber ?? null) : null,
    installment_total: data.isInstallment ? (data.installmentTotal ?? null) : null
  };
}

function buildUpdateData(existingTransaction, data) {
  const updateData = {};

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.amount !== undefined) {
    updateData.amount = toDecimalString(data.amount);
  }

  if (data.type !== undefined) {
    updateData.type = data.type;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.transactionDate !== undefined) {
    updateData.transaction_date = data.transactionDate;
  }

  if (data.paymentMethod !== undefined) {
    updateData.payment_method = data.paymentMethod;
  }

  if (data.accountId !== undefined) {
    updateData.account_id = data.accountId || null;
  }

  if (data.creditCardId !== undefined) {
    updateData.credit_card_id = data.creditCardId || null;
  }

  if (data.categoryId !== undefined) {
    updateData.category_id = data.categoryId || null;
  }

  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  if (data.isInstallment !== undefined) {
    updateData.is_installment = data.isInstallment;
  }

  const isInstallment = data.isInstallment ?? existingTransaction.is_installment;
  const installmentNumber = data.installmentNumber !== undefined ? data.installmentNumber : existingTransaction.installment_number;
  const installmentTotal = data.installmentTotal !== undefined ? data.installmentTotal : existingTransaction.installment_total;

  updateData.installment_number = isInstallment ? (installmentNumber ?? null) : null;
  updateData.installment_total = isInstallment ? (installmentTotal ?? null) : null;

  return updateData;
}

async function listTransactions(tenantId, filters) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;
  const where = buildListWhere(tenantId, filters);

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: getTransactionInclude(),
      orderBy: [
        { transaction_date: 'desc' },
        { created_at: 'desc' }
      ],
      skip,
      take: limit
    }),
    prisma.transaction.count({ where })
  ]);

  return {
    data: transactions.map(toTransactionResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

async function getTransactionById(transactionId, tenantId) {
  const transaction = await findTransactionByTenant(transactionId, tenantId);

  if (!transaction) {
    throw new AppError('Transacao nao encontrada', 404);
  }

  return toTransactionResponse(transaction);
}

async function createTransaction(data, tenantId, userId) {
  await validateRelations(data, tenantId);

  const transaction = await prisma.transaction.create({
    data: buildCreateData(data, tenantId, userId),
    include: getTransactionInclude()
  });

  return toTransactionResponse(transaction);
}

async function updateTransaction(transactionId, tenantId, data) {
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });

  if (!existingTransaction) {
    throw new AppError('Transacao nao encontrada', 404);
  }

  const mergedData = {
    description: data.description ?? existingTransaction.description,
    amount: data.amount ?? toNumber(existingTransaction.amount),
    type: data.type ?? existingTransaction.type,
    status: data.status ?? existingTransaction.status,
    transactionDate: data.transactionDate ?? existingTransaction.transaction_date,
    paymentMethod: data.paymentMethod ?? existingTransaction.payment_method,
    accountId: data.accountId !== undefined ? data.accountId : existingTransaction.account_id,
    creditCardId: data.creditCardId !== undefined ? data.creditCardId : existingTransaction.credit_card_id,
    categoryId: data.categoryId !== undefined ? data.categoryId : existingTransaction.category_id,
    notes: data.notes !== undefined ? data.notes : existingTransaction.notes,
    isInstallment: data.isInstallment ?? existingTransaction.is_installment,
    installmentNumber: data.installmentNumber !== undefined ? data.installmentNumber : existingTransaction.installment_number,
    installmentTotal: data.installmentTotal !== undefined ? data.installmentTotal : existingTransaction.installment_total
  };

  await validateRelations(mergedData, tenantId);

  const transaction = await prisma.transaction.update({
    where: {
      id: existingTransaction.id
    },
    data: buildUpdateData(existingTransaction, data),
    include: getTransactionInclude()
  });

  return toTransactionResponse(transaction);
}

async function deleteTransaction(transactionId, tenantId) {
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });

  if (!existingTransaction) {
    throw new AppError('Transacao nao encontrada', 404);
  }

  await prisma.transaction.update({
    where: {
      id: existingTransaction.id
    },
    data: {
      deleted_at: new Date()
    }
  });

  return {
    message: 'Transacao excluida com sucesso'
  };
}

async function getMonthSummary(tenantId, filters) {
  const now = new Date();
  const month = filters.month || now.getMonth() + 1;
  const year = filters.year || now.getFullYear();
  const range = getMonthRange(month, year);

  const [totals, totalTransactions] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['type'],
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        status: 'CONFIRMED',
        transaction_date: {
          gte: range.start,
          lte: range.end
        },
        type: {
          in: ['INCOME', 'EXPENSE', 'INVESTMENT']
        }
      },
      _sum: {
        amount: true
      }
    }),
    prisma.transaction.count({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        status: 'CONFIRMED',
        transaction_date: {
          gte: range.start,
          lte: range.end
        }
      }
    })
  ]);

  const income = toNumber(totals.find((item) => item.type === 'INCOME')?._sum.amount);
  const expense = toNumber(totals.find((item) => item.type === 'EXPENSE')?._sum.amount);
  const investment = toNumber(totals.find((item) => item.type === 'INVESTMENT')?._sum.amount);

  return {
    month,
    year,
    income,
    expense,
    investment,
    balance: income - expense - investment,
    totalTransactions
  };
}

module.exports = {
  listTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthSummary
};
