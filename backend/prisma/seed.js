require('dotenv/config');

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  errorFormat: 'minimal'
});

const SEED_NOTE = 'Seed inicial demo';

const CATEGORY_DEFINITIONS = [
  { name: 'Salário', type: 'INCOME' },
  { name: 'Freelance', type: 'INCOME' },
  { name: 'Rendimentos', type: 'INCOME' },
  { name: 'Reembolso', type: 'INCOME' },
  { name: 'Alimentação', type: 'EXPENSE' },
  { name: 'Mercado', type: 'EXPENSE' },
  { name: 'Moradia', type: 'EXPENSE' },
  { name: 'Transporte', type: 'EXPENSE' },
  { name: 'Saúde', type: 'EXPENSE' },
  { name: 'Educação', type: 'EXPENSE' },
  { name: 'Lazer', type: 'EXPENSE' },
  { name: 'Assinaturas', type: 'EXPENSE' },
  { name: 'Cartão de crédito', type: 'EXPENSE' },
  { name: 'Impostos', type: 'EXPENSE' },
  { name: 'Pets', type: 'EXPENSE' },
  { name: 'Família', type: 'EXPENSE' },
  { name: 'Outros', type: 'EXPENSE' },
  { name: 'Renda Fixa', type: 'INVESTMENT' },
  { name: 'Renda Variável', type: 'INVESTMENT' },
  { name: 'Cripto', type: 'INVESTMENT' },
  { name: 'Reserva de Emergência', type: 'INVESTMENT' },
  { name: 'Transferência entre contas', type: 'TRANSFER' }
];

function buildDateInCurrentMonth(preferredDay) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(preferredDay, lastDayOfMonth, now.getDate());

  return new Date(Date.UTC(year, month, safeDay, 12, 0, 0));
}

function buildDayRange(date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

async function upsertByLookup(delegate, where, create, update = create) {
  const existing = await delegate.findFirst({ where });

  if (existing) {
    return delegate.update({
      where: { id: existing.id },
      data: update
    });
  }

  return delegate.create({ data: create });
}

async function ensureGlobalCategories() {
  const categoriesByKey = {};

  for (const category of CATEGORY_DEFINITIONS) {
    const record = await upsertByLookup(
      prisma.category,
      {
        tenant_id: null,
        name: category.name,
        type: category.type
      },
      {
        tenant_id: null,
        name: category.name,
        type: category.type,
        is_default: true,
        is_active: true,
        deleted_at: null
      },
      {
        is_default: true,
        is_active: true,
        deleted_at: null
      }
    );

    categoriesByKey[`${category.type}:${category.name}`] = record;
  }

  return categoriesByKey;
}

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const tenant = await upsertByLookup(
    prisma.tenant,
    { email: 'demo@financeai.com' },
    {
      name: 'Finance AI Demo',
      email: 'demo@financeai.com',
      status: 'ACTIVE',
      plan: 'PREMIUM',
      deleted_at: null
    },
    {
      name: 'Finance AI Demo',
      status: 'ACTIVE',
      plan: 'PREMIUM',
      deleted_at: null
    }
  );

  const user = await prisma.user.upsert({
    where: { email: 'admin@financeai.com' },
    create: {
      name: 'Admin Demo',
      email: 'admin@financeai.com',
      password_hash: passwordHash,
      status: 'ACTIVE',
      deleted_at: null
    },
    update: {
      name: 'Admin Demo',
      password_hash: passwordHash,
      status: 'ACTIVE',
      deleted_at: null
    }
  });

  await prisma.userTenant.upsert({
    where: {
      user_id_tenant_id: {
        user_id: user.id,
        tenant_id: tenant.id
      }
    },
    create: {
      user_id: user.id,
      tenant_id: tenant.id,
      role: 'OWNER'
    },
    update: {
      role: 'OWNER'
    }
  });

  const categories = await ensureGlobalCategories();

  const checkingAccount = await upsertByLookup(
    prisma.account,
    {
      tenant_id: tenant.id,
      name: 'Conta Corrente Nubank'
    },
    {
      tenant_id: tenant.id,
      user_id: user.id,
      name: 'Conta Corrente Nubank',
      type: 'CHECKING',
      bank_name: 'Nubank',
      initial_balance: '2500.00',
      current_balance: '2500.00',
      currency: 'BRL',
      is_active: true,
      deleted_at: null
    },
    {
      user_id: user.id,
      type: 'CHECKING',
      bank_name: 'Nubank',
      initial_balance: '2500.00',
      current_balance: '2500.00',
      currency: 'BRL',
      is_active: true,
      deleted_at: null
    }
  );

  const walletAccount = await upsertByLookup(
    prisma.account,
    {
      tenant_id: tenant.id,
      name: 'Carteira'
    },
    {
      tenant_id: tenant.id,
      user_id: user.id,
      name: 'Carteira',
      type: 'CASH',
      initial_balance: '300.00',
      current_balance: '300.00',
      currency: 'BRL',
      is_active: true,
      deleted_at: null
    },
    {
      user_id: user.id,
      type: 'CASH',
      initial_balance: '300.00',
      current_balance: '300.00',
      currency: 'BRL',
      is_active: true,
      deleted_at: null
    }
  );

  const creditCard = await upsertByLookup(
    prisma.creditCard,
    {
      tenant_id: tenant.id,
      name: 'Cartão Nubank'
    },
    {
      tenant_id: tenant.id,
      user_id: user.id,
      account_id: checkingAccount.id,
      name: 'Cartão Nubank',
      brand: 'MASTERCARD',
      limit_amount: '5000.00',
      closing_day: 10,
      due_day: 17,
      is_active: true,
      deleted_at: null
    },
    {
      user_id: user.id,
      account_id: checkingAccount.id,
      brand: 'MASTERCARD',
      limit_amount: '5000.00',
      closing_day: 10,
      due_day: 17,
      is_active: true,
      deleted_at: null
    }
  );

  const transactions = [
    {
      external_id: 'seed-transaction-salario',
      description: 'Salário',
      amount: '5000.00',
      type: 'INCOME',
      categoryKey: 'INCOME:Salário',
      transaction_date: buildDateInCurrentMonth(5),
      payment_method: 'TRANSFER',
      account_id: checkingAccount.id
    },
    {
      external_id: 'seed-transaction-freelance-sistema',
      description: 'Freelance sistema',
      amount: '1200.00',
      type: 'INCOME',
      categoryKey: 'INCOME:Freelance',
      transaction_date: buildDateInCurrentMonth(8),
      payment_method: 'PIX',
      account_id: checkingAccount.id
    },
    {
      external_id: 'seed-transaction-mercado',
      description: 'Mercado',
      amount: '650.00',
      type: 'EXPENSE',
      categoryKey: 'EXPENSE:Mercado',
      transaction_date: buildDateInCurrentMonth(9),
      payment_method: 'DEBIT_CARD',
      account_id: checkingAccount.id
    },
    {
      external_id: 'seed-transaction-ifood',
      description: 'Ifood',
      amount: '89.90',
      type: 'EXPENSE',
      categoryKey: 'EXPENSE:Alimentação',
      transaction_date: buildDateInCurrentMonth(11),
      payment_method: 'CREDIT_CARD',
      credit_card_id: creditCard.id
    },
    {
      external_id: 'seed-transaction-uber',
      description: 'Uber',
      amount: '42.50',
      type: 'EXPENSE',
      categoryKey: 'EXPENSE:Transporte',
      transaction_date: buildDateInCurrentMonth(12),
      payment_method: 'CREDIT_CARD',
      credit_card_id: creditCard.id
    },
    {
      external_id: 'seed-transaction-netflix',
      description: 'Netflix',
      amount: '39.90',
      type: 'EXPENSE',
      categoryKey: 'EXPENSE:Assinaturas',
      transaction_date: buildDateInCurrentMonth(13),
      payment_method: 'CREDIT_CARD',
      credit_card_id: creditCard.id
    },
    {
      external_id: 'seed-transaction-energia',
      description: 'Energia',
      amount: '180.00',
      type: 'EXPENSE',
      categoryKey: 'EXPENSE:Moradia',
      transaction_date: buildDateInCurrentMonth(14),
      payment_method: 'PIX',
      account_id: checkingAccount.id
    },
    {
      external_id: 'seed-transaction-internet',
      description: 'Internet',
      amount: '120.00',
      type: 'EXPENSE',
      categoryKey: 'EXPENSE:Moradia',
      transaction_date: buildDateInCurrentMonth(15),
      payment_method: 'PIX',
      account_id: checkingAccount.id
    },
    {
      external_id: 'seed-transaction-farmacia',
      description: 'Farmácia',
      amount: '75.30',
      type: 'EXPENSE',
      categoryKey: 'EXPENSE:Saúde',
      transaction_date: buildDateInCurrentMonth(16),
      payment_method: 'CASH',
      account_id: walletAccount.id
    },
    {
      external_id: 'seed-transaction-academia',
      description: 'Academia',
      amount: '99.90',
      type: 'EXPENSE',
      categoryKey: 'EXPENSE:Saúde',
      transaction_date: buildDateInCurrentMonth(18),
      payment_method: 'CREDIT_CARD',
      credit_card_id: creditCard.id
    }
  ];

  for (const transaction of transactions) {
    const dayRange = buildDayRange(transaction.transaction_date);

    await upsertByLookup(
      prisma.transaction,
      {
        OR: [
          { external_id: transaction.external_id },
          {
            tenant_id: tenant.id,
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            notes: SEED_NOTE,
            transaction_date: {
              gte: dayRange.start,
              lte: dayRange.end
            }
          }
        ]
      },
      {
        tenant_id: tenant.id,
        user_id: user.id,
        account_id: transaction.account_id || null,
        credit_card_id: transaction.credit_card_id || null,
        category_id: categories[transaction.categoryKey].id,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        status: 'CONFIRMED',
        transaction_date: transaction.transaction_date,
        payment_method: transaction.payment_method,
        notes: SEED_NOTE,
        source: 'MANUAL',
        external_id: transaction.external_id,
        is_recurring: false,
        is_installment: false,
        deleted_at: null
      },
      {
        user_id: user.id,
        account_id: transaction.account_id || null,
        credit_card_id: transaction.credit_card_id || null,
        category_id: categories[transaction.categoryKey].id,
        amount: transaction.amount,
        status: 'CONFIRMED',
        transaction_date: transaction.transaction_date,
        payment_method: transaction.payment_method,
        notes: SEED_NOTE,
        source: 'MANUAL',
        external_id: transaction.external_id,
        is_recurring: false,
        is_installment: false,
        deleted_at: null
      }
    );
  }

  console.log('Seed concluido com sucesso.');
  console.log(`Tenant: ${tenant.name} (${tenant.email})`);
  console.log(`Usuario admin: ${user.email}`);
  console.log(`Categorias globais: ${CATEGORY_DEFINITIONS.length}`);
  console.log('Contas demo: Conta Corrente Nubank, Carteira');
  console.log('Cartao demo: Cartão Nubank');
  console.log(`Transacoes demo: ${transactions.length}`);
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
