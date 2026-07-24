const { randomUUID } = require('crypto');

const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const { formatDateOnly } = require('../../utils/date-utils');
const { getInvoiceReferenceForDate, syncTransactionInvoiceChanges } = require('../../utils/credit-card-invoice');

const INSTALLMENT_TRANSACTION_OPTIONS = { timeout: 120000 };

function toDecimalString(value) {
  return Number(value || 0).toFixed(2);
}

function toNumber(value) {
  return Number(value || 0);
}

function toCents(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100);
}

function splitAmountInCents(value, installmentTotal) {
  const totalCents = toCents(value);

  if (totalCents < installmentTotal) {
    throw new AppError('O valor total deve permitir parcelas de pelo menos R$ 0,01', 400);
  }

  const baseAmount = Math.floor(totalCents / installmentTotal);
  const remainder = totalCents % installmentTotal;

  return Array.from({ length: installmentTotal }, (_item, index) => (
    baseAmount + (index < remainder ? 1 : 0)
  ));
}

function addMonthsKeepingDay(date, monthsToAdd) {
  const sourceDate = new Date(date);
  const targetMonth = sourceDate.getMonth() + monthsToAdd;
  const targetYear = sourceDate.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();

  return new Date(targetYear, normalizedMonth, Math.min(sourceDate.getDate(), lastDay), 12, 0, 0, 0);
}

function removeInstallmentSuffix(description) {
  return description.replace(/\s+\d+\/\d+$/, '');
}

function buildInstallmentInvoiceTargets(data) {
  return Array.from({ length: data.installmentTotal }, (_item, index) => ({
    credit_card_id: data.creditCardId,
    transaction_date: addMonthsKeepingDay(data.transactionDate, index)
  }));
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
    transferId: transaction.transfer_id || null,
    description: transaction.description,
    amount: toNumber(transaction.amount),
    type: transaction.type,
    status: transaction.status,
    transactionDate: formatDateOnly(transaction.transaction_date),
    paymentMethod: transaction.payment_method,
    source: transaction.source,
    isRecurring: transaction.is_recurring,
    isInstallment: transaction.is_installment,
    installmentNumber: transaction.installment_number,
    installmentTotal: transaction.installment_total,
    installmentGroupId: transaction.installment_group_id,
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
  const isCreditCardPayment = data.paymentMethod === 'CREDIT_CARD';
  const accountId = isCreditCardPayment ? null : (data.accountId === undefined ? undefined : (data.accountId || null));
  const creditCardId = isCreditCardPayment ? (data.creditCardId === undefined ? undefined : (data.creditCardId || null)) : null;
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

  if (nextPaymentMethod === 'CREDIT_CARD' && !creditCardId) {
    throw new AppError('Informe o cartao de credito da transacao', 400);
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

async function assertNoPaidInvoiceTransactions(tenantId, transactions) {
  const targets = new Map();
  const cards = new Map();

  for (const transaction of transactions) {
    if (!transaction.credit_card_id || !transaction.transaction_date) {
      continue;
    }

    let card = cards.get(transaction.credit_card_id);

    if (!card) {
      card = await findCreditCardByTenant(transaction.credit_card_id, tenantId);

      if (card) {
        cards.set(card.id, card);
      }
    }

    if (!card) {
      continue;
    }

    const reference = getInvoiceReferenceForDate(card.closing_day, transaction.transaction_date);
    targets.set(
      `${card.id}:${reference.referenceMonth}:${reference.referenceYear}`,
      { card, reference }
    );
  }

  for (const { card, reference } of targets.values()) {
    const paidInvoice = await prisma.creditCardInvoice.findFirst({
      where: {
        tenantId,
        creditCardId: card.id,
        referenceMonth: reference.referenceMonth,
        referenceYear: reference.referenceYear,
        status: 'PAID',
        deletedAt: null
      },
      select: { id: true }
    });

    if (paidInvoice) {
      throw new AppError('Nao e possivel criar ou alterar parcelas vinculadas a uma fatura paga', 422);
    }
  }
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

  if (filters.origin === 'account') {
    where.account_id = { not: null };
    where.credit_card_id = null;
  } else if (filters.origin === 'credit_card') {
    where.credit_card_id = { not: null };
    where.account_id = null;
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
  } else {
    const now = new Date();
    const range = getMonthRange(now.getMonth() + 1, now.getFullYear());

    where.transaction_date = {
      gte: range.start,
      lte: range.end
    };
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

function buildCreateData(data, tenantId, userId, overrides = {}) {
  const isCreditCardPayment = data.paymentMethod === 'CREDIT_CARD';

  return {
    tenant_id: tenantId,
    user_id: userId,
    account_id: isCreditCardPayment ? null : (data.accountId || null),
    credit_card_id: isCreditCardPayment ? (data.creditCardId || null) : null,
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
    installment_total: data.isInstallment ? (data.installmentTotal ?? null) : null,
    installment_group_id: null,
    ...overrides
  };
}

async function createInstallmentTransactions(database, data, tenantId, userId, installmentGroupId) {
  const installmentTotal = data.installmentTotal;
  const installmentAmounts = splitAmountInCents(data.amount, installmentTotal);
  const transactions = [];

  for (let index = 0; index < installmentTotal; index += 1) {
    const installmentNumber = index + 1;
    const transaction = await database.transaction.create({
      data: buildCreateData(data, tenantId, userId, {
        amount: (installmentAmounts[index] / 100).toFixed(2),
        description: `${removeInstallmentSuffix(data.description)} ${installmentNumber}/${installmentTotal}`,
        transaction_date: addMonthsKeepingDay(data.transactionDate, index),
        installment_number: installmentNumber,
        installment_total: installmentTotal,
        installment_group_id: installmentGroupId
      }),
      include: getTransactionInclude()
    });

    transactions.push(transaction);
  }

  return transactions;
}

function buildUpdateData(existingTransaction, data) {
  const updateData = {};
  const paymentMethod = data.paymentMethod ?? existingTransaction.payment_method;
  const isCreditCardPayment = paymentMethod === 'CREDIT_CARD';

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

  if (isCreditCardPayment) {
    updateData.account_id = null;

    if (data.creditCardId !== undefined) {
      updateData.credit_card_id = data.creditCardId || null;
    }
  } else {
    updateData.credit_card_id = null;

    if (data.accountId !== undefined) {
      updateData.account_id = data.accountId || null;
    }
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

  if (!transaction.installment_group_id) {
    return toTransactionResponse(transaction);
  }

  const installments = await prisma.transaction.findMany({
    where: {
      tenant_id: tenantId,
      installment_group_id: transaction.installment_group_id,
      deleted_at: null
    },
    include: getTransactionInclude(),
    orderBy: { installment_number: 'asc' }
  });
  const firstInstallment = installments[0] || transaction;

  return {
    ...toTransactionResponse(firstInstallment),
    id: transactionId,
    description: removeInstallmentSuffix(firstInstallment.description),
    amount: installments.reduce((sum, installment) => sum + toNumber(installment.amount), 0)
  };
}

async function createTransaction(data, tenantId, userId) {
  await validateRelations(data, tenantId);

  if (data.isInstallment) {
    await assertNoPaidInvoiceTransactions(tenantId, buildInstallmentInvoiceTargets(data));

    const transactions = await prisma.$transaction(async (database) => {
      const createdTransactions = await createInstallmentTransactions(
        database,
        data,
        tenantId,
        userId,
        randomUUID()
      );

      await syncTransactionInvoiceChanges(
        tenantId,
        null,
        createdTransactions,
        database,
        { rejectPaidInvoices: true }
      );

      return createdTransactions;
    }, INSTALLMENT_TRANSACTION_OPTIONS);

    return toTransactionResponse(transactions[0]);
  }

  const transaction = await prisma.transaction.create({
    data: buildCreateData(data, tenantId, userId),
    include: getTransactionInclude()
  });

  await syncTransactionInvoiceChanges(tenantId, null, transaction);

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

  const existingInstallments = existingTransaction.installment_group_id
    ? await prisma.transaction.findMany({
      where: {
        tenant_id: tenantId,
        installment_group_id: existingTransaction.installment_group_id,
        deleted_at: null
      },
      orderBy: { installment_number: 'asc' }
    })
    : [existingTransaction];
  const firstExistingTransaction = existingInstallments[0] || existingTransaction;
  const existingAmount = existingTransaction.installment_group_id
    ? existingInstallments.reduce((sum, installment) => sum + toNumber(installment.amount), 0)
    : toNumber(existingTransaction.amount);

  const mergedData = {
    description: data.description ?? removeInstallmentSuffix(firstExistingTransaction.description),
    amount: data.amount ?? existingAmount,
    type: data.type ?? firstExistingTransaction.type,
    status: data.status ?? firstExistingTransaction.status,
    transactionDate: data.transactionDate ?? firstExistingTransaction.transaction_date,
    paymentMethod: data.paymentMethod ?? firstExistingTransaction.payment_method,
    accountId: data.accountId !== undefined ? data.accountId : firstExistingTransaction.account_id,
    creditCardId: data.creditCardId !== undefined ? data.creditCardId : firstExistingTransaction.credit_card_id,
    categoryId: data.categoryId !== undefined ? data.categoryId : firstExistingTransaction.category_id,
    notes: data.notes !== undefined ? data.notes : firstExistingTransaction.notes,
    isInstallment: data.isInstallment ?? existingTransaction.is_installment,
    installmentNumber: data.installmentNumber !== undefined ? data.installmentNumber : existingTransaction.installment_number,
    installmentTotal: data.installmentTotal !== undefined ? data.installmentTotal : existingTransaction.installment_total
  };

  await validateRelations(mergedData, tenantId);

  if (existingTransaction.is_installment || mergedData.isInstallment) {
    await assertNoPaidInvoiceTransactions(tenantId, existingInstallments);

    if (mergedData.isInstallment) {
      await assertNoPaidInvoiceTransactions(tenantId, buildInstallmentInvoiceTargets(mergedData));
    }

    const transaction = await prisma.$transaction(async (database) => {
      await database.transaction.updateMany({
        where: existingTransaction.installment_group_id
          ? {
            tenant_id: tenantId,
            installment_group_id: existingTransaction.installment_group_id,
            deleted_at: null
          }
          : {
            id: existingTransaction.id,
            tenant_id: tenantId,
            deleted_at: null
          },
        data: { deleted_at: new Date() }
      });

      let updatedTransactions;

      if (mergedData.isInstallment) {
        updatedTransactions = await createInstallmentTransactions(
          database,
          mergedData,
          tenantId,
          existingTransaction.user_id,
          existingTransaction.installment_group_id || randomUUID()
        );
      } else {
        updatedTransactions = [await database.transaction.create({
          data: buildCreateData({
            ...mergedData,
            isInstallment: false,
            installmentNumber: null,
            installmentTotal: null
          }, tenantId, existingTransaction.user_id),
          include: getTransactionInclude()
        })];
      }

      await syncTransactionInvoiceChanges(
        tenantId,
        existingInstallments,
        updatedTransactions,
        database,
        { rejectPaidInvoices: true }
      );

      return updatedTransactions[0];
    }, INSTALLMENT_TRANSACTION_OPTIONS);

    return toTransactionResponse(transaction);
  }

  const transaction = await prisma.transaction.update({
    where: {
      id: existingTransaction.id
    },
    data: buildUpdateData(existingTransaction, data),
    include: getTransactionInclude()
  });

  await syncTransactionInvoiceChanges(tenantId, existingTransaction, transaction);

  return toTransactionResponse(transaction);
}

async function confirmTransaction(transactionId, tenantId) {
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      tenant_id: tenantId,
      deleted_at: null
    },
    include: getTransactionInclude()
  });

  if (!existingTransaction) {
    throw new AppError('Transacao nao encontrada', 404);
  }

  if (existingTransaction.status !== 'PENDING') {
    throw new AppError('Apenas transacoes pendentes podem ser confirmadas', 422);
  }

  const transaction = await prisma.transaction.update({
    where: {
      id: existingTransaction.id
    },
    data: {
      status: 'CONFIRMED'
    },
    include: getTransactionInclude()
  });

  await syncTransactionInvoiceChanges(tenantId, existingTransaction, transaction);

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

  if (existingTransaction.is_installment) {
    const installments = existingTransaction.installment_group_id
      ? await prisma.transaction.findMany({
        where: {
          tenant_id: tenantId,
          installment_group_id: existingTransaction.installment_group_id,
          deleted_at: null
        }
      })
      : [existingTransaction];

    await assertNoPaidInvoiceTransactions(tenantId, installments);

    await prisma.$transaction(async (database) => {
      await database.transaction.updateMany({
        where: existingTransaction.installment_group_id
          ? {
            tenant_id: tenantId,
            installment_group_id: existingTransaction.installment_group_id,
            deleted_at: null
          }
          : {
            id: existingTransaction.id,
            tenant_id: tenantId,
            deleted_at: null
          },
        data: { deleted_at: new Date() }
      });

      await syncTransactionInvoiceChanges(
        tenantId,
        installments,
        null,
        database,
        { rejectPaidInvoices: true }
      );
    }, INSTALLMENT_TRANSACTION_OPTIONS);

    return {
      message: 'Transacao excluida com sucesso'
    };
  }

  await prisma.transaction.update({
    where: {
      id: existingTransaction.id
    },
    data: {
      deleted_at: new Date()
    }
  });

  await syncTransactionInvoiceChanges(tenantId, existingTransaction, null);

  return {
    message: 'Transacao excluida com sucesso'
  };
}

async function getMonthSummary(tenantId, filters) {
  const now = new Date();
  const month = filters.month || now.getMonth() + 1;
  const year = filters.year || now.getFullYear();
  const range = getMonthRange(month, year);

  const baseWhere = {
    tenant_id: tenantId,
    deleted_at: null,
    status: 'CONFIRMED',
    transaction_date: {
      gte: range.start,
      lte: range.end
    }
  };

  const [incomeResult, expensePaidResult, creditCardSpentResult, totalTransactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        ...baseWhere,
        type: 'INCOME'
      },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: {
        ...baseWhere,
        type: 'EXPENSE',
        payment_method: { not: 'CREDIT_CARD' }
      },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: {
        ...baseWhere,
        type: 'EXPENSE',
        payment_method: 'CREDIT_CARD'
      },
      _sum: { amount: true }
    }),
    prisma.transaction.count({
      where: baseWhere
    })
  ]);

  const income = toNumber(incomeResult._sum.amount);
  const expensePaid = toNumber(expensePaidResult._sum.amount);
  const creditCardSpent = toNumber(creditCardSpentResult._sum.amount);

  return {
    month,
    year,
    income,
    expensePaid,
    creditCardSpent,
    balance: income - expensePaid,
    totalTransactions
  };
}

module.exports = {
  listTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  confirmTransaction,
  deleteTransaction,
  getMonthSummary
};
