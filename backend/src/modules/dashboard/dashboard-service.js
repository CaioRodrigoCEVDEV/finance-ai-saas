const prisma = require('../../config/prisma');
const {
  formatMonthKey,
  getCurrentMonthRange,
  getLastMonths
} = require('./dashboard-date-helper');

const UNCATEGORIZED_LABEL = 'Sem categoria';

function toNumber(value) {
  return Number(value || 0);
}

async function getSummary(tenantId) {
  const currentMonth = getCurrentMonthRange();

  const [accountBalance, transactionTotals] = await Promise.all([
    prisma.account.aggregate({
      where: {
        tenant_id: tenantId,
        is_active: true,
        deleted_at: null
      },
      _sum: {
        current_balance: true
      }
    }),
    prisma.transaction.groupBy({
      by: ['type'],
      where: {
        tenant_id: tenantId,
        deleted_at: null,
        status: 'CONFIRMED',
        transaction_date: {
          gte: currentMonth.start,
          lte: currentMonth.end
        },
        type: {
          in: ['INCOME', 'EXPENSE']
        }
      },
      _sum: {
        amount: true
      }
    })
  ]);

  const monthlyIncome = toNumber(
    transactionTotals.find((item) => item.type === 'INCOME')?._sum.amount
  );
  const monthlyExpense = toNumber(
    transactionTotals.find((item) => item.type === 'EXPENSE')?._sum.amount
  );
  const monthlyEconomy = monthlyIncome - monthlyExpense;
  const expensePercentage = monthlyIncome > 0
    ? Number(((monthlyExpense / monthlyIncome) * 100).toFixed(2))
    : 0;

  return {
    summary: {
      totalBalance: toNumber(accountBalance._sum.current_balance),
      monthlyIncome,
      monthlyExpense,
      monthlyEconomy,
      expensePercentage
    }
  };
}

async function getExpensesByCategory(tenantId) {
  const currentMonth = getCurrentMonthRange();

  const groupedExpenses = await prisma.transaction.groupBy({
    by: ['category_id'],
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      type: 'EXPENSE',
      transaction_date: {
        gte: currentMonth.start,
        lte: currentMonth.end
      }
    },
    _sum: {
      amount: true
    },
    orderBy: {
      _sum: {
        amount: 'desc'
      }
    }
  });

  const categoryIds = groupedExpenses
    .map((item) => item.category_id)
    .filter(Boolean);

  const categories = categoryIds.length > 0
    ? await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds
        }
      },
      select: {
        id: true,
        name: true
      }
    })
    : [];

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const totalExpense = groupedExpenses.reduce((sum, item) => sum + toNumber(item._sum.amount), 0);

  return groupedExpenses.map((item) => {
    const amount = toNumber(item._sum.amount);
    const percentage = totalExpense > 0
      ? Number(((amount / totalExpense) * 100).toFixed(2))
      : 0;

    return {
      categoryId: item.category_id,
      categoryName: item.category_id ? (categoryMap.get(item.category_id) || UNCATEGORIZED_LABEL) : UNCATEGORIZED_LABEL,
      amount,
      percentage
    };
  });
}

async function getRecentTransactions(tenantId) {

  const transactions = await prisma.transaction.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null
    },
    orderBy: {
      transaction_date: 'desc'
    },
    take: 10,
    select: {
      id: true,
      description: true,
      amount: true,
      type: true,
      status: true,
      transaction_date: true,
      category: {
        select: {
          name: true
        }
      },
      account: {
        select: {
          name: true
        }
      },
      credit_card: {
        select: {
          name: true
        }
      }
    }
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    description: transaction.description,
    amount: toNumber(transaction.amount),
    type: transaction.type,
    status: transaction.status,
    categoryName: transaction.category?.name || UNCATEGORIZED_LABEL,
    accountName: transaction.account?.name || null,
    creditCardName: transaction.credit_card?.name || null,
    transactionDate: transaction.transaction_date.toISOString()
  }));
}

async function getMonthlyFlow(tenantId) {
  const months = getLastMonths(6);

  const transactions = await prisma.transaction.findMany({
    where: {
      tenant_id: tenantId,
      deleted_at: null,
      status: 'CONFIRMED',
      transaction_date: {
        gte: months[0].start,
        lte: months[months.length - 1].end
      },
      type: {
        in: ['INCOME', 'EXPENSE']
      }
    },
    select: {
      amount: true,
      type: true,
      transaction_date: true
    }
  });

  const monthlyTotals = new Map(
    months.map((month) => [month.key, { month: month.key, income: 0, expense: 0, economy: 0 }])
  );

  for (const transaction of transactions) {
    const monthKey = formatMonthKey(transaction.transaction_date);
    const monthData = monthlyTotals.get(monthKey);

    if (!monthData) {
      continue;
    }

    const amount = toNumber(transaction.amount);

    if (transaction.type === 'INCOME') {
      monthData.income += amount;
      continue;
    }

    if (transaction.type === 'EXPENSE') {
      monthData.expense += amount;
    }
  }

  return months.map((month) => {
    const monthData = monthlyTotals.get(month.key);

    monthData.economy = monthData.income - monthData.expense;

    return monthData;
  });
}

module.exports = {
  getExpensesByCategory,
  getMonthlyFlow,
  getRecentTransactions,
  getSummary
};
