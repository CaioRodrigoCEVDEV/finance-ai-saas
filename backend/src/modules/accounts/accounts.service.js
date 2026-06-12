const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const planService = require('../plans/plan.service');

function toDecimalString(value) {
  return Number(value || 0).toFixed(2);
}

function toNumber(value) {
  return Number(value || 0);
}

function toAccountResponse(account, computedBalance) {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    bankName: account.bank_name,
    initialBalance: Number(account.initial_balance),
    currentBalance: computedBalance !== undefined ? computedBalance : Number(account.current_balance),
    currency: account.currency,
    color: account.color,
    icon: account.icon,
    isActive: account.is_active,
    createdAt: account.created_at.toISOString(),
    updatedAt: account.updated_at.toISOString()
  };
}

async function findAccountByTenant(accountId, tenantId) {
  return prisma.account.findFirst({
    where: {
      id: accountId,
      tenant_id: tenantId,
      deleted_at: null
    }
  });
}

async function computeAccountBalances(tenantId, accountIds) {
  if (!accountIds || accountIds.length === 0) {
    return {};
  }

  const aggregates = await prisma.transaction.groupBy({
    by: ['account_id', 'type'],
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      account_id: { in: accountIds }
    },
    _sum: { amount: true }
  });

  const map = {};

  for (const agg of aggregates) {
    if (!map[agg.account_id]) {
      map[agg.account_id] = { INCOME: 0, EXPENSE: 0 };
    }

    const amount = toNumber(agg._sum.amount);

    if (agg.type === 'INCOME') {
      map[agg.account_id].INCOME += amount;
    } else {
      map[agg.account_id].EXPENSE += amount;
    }
  }

  return map;
}

function computeBalanceForAccount(account, transactionTotals) {
  const tx = transactionTotals || { INCOME: 0, EXPENSE: 0 };
  return toNumber(account.initial_balance) + tx.INCOME - tx.EXPENSE;
}

async function listAccounts(tenantId) {
  const accounts = await prisma.account.findMany({
    where: {
      tenant_id: tenantId,
      is_active: true,
      deleted_at: null
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  const accountIds = accounts.map((a) => a.id);
  const balances = await computeAccountBalances(tenantId, accountIds);

  return accounts.map((account) => {
    const computed = computeBalanceForAccount(account, balances[account.id]);
    return toAccountResponse(account, computed);
  });
}

async function getAccountById(accountId, tenantId) {
  const account = await findAccountByTenant(accountId, tenantId);

  if (!account) {
    throw new AppError('Conta nao encontrada', 404);
  }

  const balances = await computeAccountBalances(tenantId, [accountId]);
  const computed = computeBalanceForAccount(account, balances[accountId]);

  return toAccountResponse(account, computed);
}

async function createAccount(data, tenantId, userId) {
  await planService.assertCanCreateAccount(tenantId);

  const initialBalance = data.initialBalance ?? data.currentBalance ?? 0;
  const currentBalance = data.currentBalance ?? initialBalance;

  const account = await prisma.account.create({
    data: {
      tenant_id: tenantId,
      user_id: userId,
      name: data.name,
      type: data.type,
      bank_name: data.bankName ?? null,
      initial_balance: toDecimalString(initialBalance),
      current_balance: toDecimalString(currentBalance),
      currency: data.currency || 'BRL',
      color: data.color ?? null,
      icon: data.icon ?? null,
      is_active: data.isActive ?? true
    }
  });

  const balances = await computeAccountBalances(tenantId, [account.id]);
  const computed = computeBalanceForAccount(account, balances[account.id]);

  return toAccountResponse(account, computed);
}

async function updateAccount(accountId, tenantId, data) {
  const existingAccount = await findAccountByTenant(accountId, tenantId);

  if (!existingAccount) {
    throw new AppError('Conta nao encontrada', 404);
  }

  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.type !== undefined) {
    updateData.type = data.type;
  }

  if (data.bankName !== undefined) {
    updateData.bank_name = data.bankName;
  }

  if (data.initialBalance !== undefined) {
    updateData.initial_balance = toDecimalString(data.initialBalance);
  }

  if (data.currentBalance !== undefined) {
    updateData.current_balance = toDecimalString(data.currentBalance);
  }

  if (data.currency !== undefined) {
    updateData.currency = data.currency;
  }

  if (data.color !== undefined) {
    updateData.color = data.color;
  }

  if (data.icon !== undefined) {
    updateData.icon = data.icon;
  }

  if (data.isActive !== undefined) {
    updateData.is_active = data.isActive;
  }

  const account = await prisma.account.update({
    where: {
      id: existingAccount.id
    },
    data: updateData
  });

  const balances = await computeAccountBalances(tenantId, [account.id]);
  const computed = computeBalanceForAccount(account, balances[account.id]);

  return toAccountResponse(account, computed);
}

async function deleteAccount(accountId, tenantId) {
  const existingAccount = await findAccountByTenant(accountId, tenantId);

  if (!existingAccount) {
    throw new AppError('Conta nao encontrada', 404);
  }

  await prisma.account.update({
    where: {
      id: existingAccount.id
    },
    data: {
      deleted_at: new Date(),
      is_active: false
    }
  });

  return {
    message: 'Conta excluida com sucesso'
  };
}

module.exports = {
  computeAccountBalances,
  listAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount
};
