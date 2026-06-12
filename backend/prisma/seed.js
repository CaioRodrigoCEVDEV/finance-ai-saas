require('dotenv/config');

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  errorFormat: 'minimal'
});

const SEED_NOTE = 'Seed demo Finance AI';

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

const RULE_DEFINITIONS = [
  { name: 'IFOOD → Alimentação', matchText: 'IFOOD', matchType: 'CONTAINS', categoryName: 'Alimentação', priority: 10 },
  { name: 'UBER → Transporte', matchText: 'UBER', matchType: 'CONTAINS', categoryName: 'Transporte', priority: 10 },
  { name: '99 → Transporte', matchText: '99', matchType: 'CONTAINS', categoryName: 'Transporte', priority: 10 },
  { name: 'NETFLIX → Assinaturas', matchText: 'NETFLIX', matchType: 'CONTAINS', categoryName: 'Assinaturas', priority: 10 },
  { name: 'SPOTIFY → Assinaturas', matchText: 'SPOTIFY', matchType: 'CONTAINS', categoryName: 'Assinaturas', priority: 10 },
  { name: 'MERCADO → Mercado', matchText: 'MERCADO', matchType: 'CONTAINS', categoryName: 'Mercado', priority: 10 },
  { name: 'SUPERMERCADO → Mercado', matchText: 'SUPERMERCADO', matchType: 'CONTAINS', categoryName: 'Mercado', priority: 10 },
  { name: 'FARMACIA → Saúde', matchText: 'FARMACIA', matchType: 'CONTAINS', categoryName: 'Saúde', priority: 10 },
  { name: 'ACADEMIA → Saúde', matchText: 'ACADEMIA', matchType: 'CONTAINS', categoryName: 'Saúde', priority: 10 },
  { name: 'SALARIO → Salário', matchText: 'SALARIO', matchType: 'CONTAINS', categoryName: 'Salário', priority: 10 }
];

function buildDate(year, month, day) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(day, lastDay);
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
    return delegate.update({ where: { id: existing.id }, data: update });
  }
  return delegate.create({ data: create });
}

async function ensureGlobalCategories() {
  const categoriesByKey = {};
  for (const category of CATEGORY_DEFINITIONS) {
    const record = await upsertByLookup(
      prisma.category,
      { tenant_id: null, name: category.name, type: category.type },
      {
        tenant_id: null,
        name: category.name,
        type: category.type,
        is_default: true,
        is_active: true,
        deleted_at: null
      },
      { is_default: true, is_active: true, deleted_at: null }
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
      plan: 'FREE',
      deleted_at: null
    },
    { name: 'Finance AI Demo', status: 'ACTIVE', plan: 'FREE', deleted_at: null }
  );

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@financeai.com' },
    create: {
      name: 'Usuário Demo',
      email: 'demo@financeai.com',
      password_hash: passwordHash,
      status: 'ACTIVE',
      deleted_at: null
    },
    update: {
      name: 'Usuário Demo',
      password_hash: passwordHash,
      status: 'ACTIVE',
      deleted_at: null
    }
  });

  await prisma.userTenant.upsert({
    where: { user_id_tenant_id: { user_id: demoUser.id, tenant_id: tenant.id } },
    create: { user_id: demoUser.id, tenant_id: tenant.id, role: 'OWNER' },
    update: { role: 'OWNER' }
  });

  await prisma.user.updateMany({
    where: { email: 'admin@financeai.com' },
    data: { global_role: 'USER' }
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'caiorodrigocev@gmail.com' },
    create: {
      name: 'Admin SaaS',
      email: 'caiorodrigocev@gmail.com',
      password_hash: passwordHash,
      status: 'ACTIVE',
      global_role: 'SUPER_ADMIN',
      deleted_at: null
    },
    update: {
      name: 'Admin SaaS',
      password_hash: passwordHash,
      status: 'ACTIVE',
      global_role: 'SUPER_ADMIN',
      deleted_at: null
    }
  });

  await prisma.userTenant.upsert({
    where: { user_id_tenant_id: { user_id: adminUser.id, tenant_id: tenant.id } },
    create: { user_id: adminUser.id, tenant_id: tenant.id, role: 'OWNER' },
    update: { role: 'OWNER' }
  });

  const categories = await ensureGlobalCategories();

  // Accounts
  const nubankAccount = await upsertByLookup(
    prisma.account,
    { tenant_id: tenant.id, name: 'Conta Corrente Nubank' },
    {
      tenant_id: tenant.id, user_id: demoUser.id, name: 'Conta Corrente Nubank',
      type: 'CHECKING', bank_name: 'Nubank', initial_balance: '3200.00', current_balance: '3200.00',
      currency: 'BRL', is_active: true, deleted_at: null
    },
    { user_id: demoUser.id, type: 'CHECKING', bank_name: 'Nubank', initial_balance: '3200.00', current_balance: '3200.00', currency: 'BRL', is_active: true, deleted_at: null }
  );

  const interAccount = await upsertByLookup(
    prisma.account,
    { tenant_id: tenant.id, name: 'Conta Inter' },
    {
      tenant_id: tenant.id, user_id: demoUser.id, name: 'Conta Inter',
      type: 'CHECKING', bank_name: 'Inter', initial_balance: '1500.00', current_balance: '1500.00',
      currency: 'BRL', is_active: true, deleted_at: null
    },
    { user_id: demoUser.id, type: 'CHECKING', bank_name: 'Inter', initial_balance: '1500.00', current_balance: '1500.00', currency: 'BRL', is_active: true, deleted_at: null }
  );

  const walletAccount = await upsertByLookup(
    prisma.account,
    { tenant_id: tenant.id, name: 'Carteira' },
    {
      tenant_id: tenant.id, user_id: demoUser.id, name: 'Carteira',
      type: 'CASH', bank_name: null, initial_balance: '250.00', current_balance: '250.00',
      currency: 'BRL', is_active: true, deleted_at: null
    },
    { user_id: demoUser.id, type: 'CASH', initial_balance: '250.00', current_balance: '250.00', currency: 'BRL', is_active: true, deleted_at: null }
  );

  const reserveAccount = await upsertByLookup(
    prisma.account,
    { tenant_id: tenant.id, name: 'Reserva CDB' },
    {
      tenant_id: tenant.id, user_id: demoUser.id, name: 'Reserva CDB',
      type: 'INVESTMENT', bank_name: 'Banco X', initial_balance: '5000.00', current_balance: '5000.00',
      currency: 'BRL', is_active: true, deleted_at: null
    },
    { user_id: demoUser.id, type: 'INVESTMENT', bank_name: 'Banco X', initial_balance: '5000.00', current_balance: '5000.00', currency: 'BRL', is_active: true, deleted_at: null }
  );

  // Credit Cards
  const nubankCard = await upsertByLookup(
    prisma.creditCard,
    { tenant_id: tenant.id, name: 'Cartão Nubank' },
    {
      tenant_id: tenant.id, user_id: demoUser.id, account_id: nubankAccount.id,
      name: 'Cartão Nubank', brand: 'MASTERCARD', limit_amount: '5000.00',
      closing_day: 10, due_day: 17, is_active: true, deleted_at: null
    },
    { user_id: demoUser.id, account_id: nubankAccount.id, brand: 'MASTERCARD', limit_amount: '5000.00', closing_day: 10, due_day: 17, is_active: true, deleted_at: null }
  );

  const interCard = await upsertByLookup(
    prisma.creditCard,
    { tenant_id: tenant.id, name: 'Cartão Inter' },
    {
      tenant_id: tenant.id, user_id: demoUser.id, account_id: interAccount.id,
      name: 'Cartão Inter', brand: 'MASTERCARD', limit_amount: '3000.00',
      closing_day: 8, due_day: 15, is_active: true, deleted_at: null
    },
    { user_id: demoUser.id, account_id: interAccount.id, brand: 'MASTERCARD', limit_amount: '3000.00', closing_day: 8, due_day: 15, is_active: true, deleted_at: null }
  );

  const mpCard = await upsertByLookup(
    prisma.creditCard,
    { tenant_id: tenant.id, name: 'Cartão Mercado Pago' },
    {
      tenant_id: tenant.id, user_id: demoUser.id, account_id: nubankAccount.id,
      name: 'Cartão Mercado Pago', brand: 'VISA', limit_amount: '2000.00',
      closing_day: 5, due_day: 12, is_active: true, deleted_at: null
    },
    { user_id: demoUser.id, account_id: nubankAccount.id, brand: 'VISA', limit_amount: '2000.00', closing_day: 5, due_day: 12, is_active: true, deleted_at: null }
  );

  // Categorization Rules
  for (const rule of RULE_DEFINITIONS) {
    const categoryKey = `EXPENSE:${rule.categoryName}`;
    const category = categories[categoryKey] || categories[`INCOME:${rule.categoryName}`];
    if (!category) continue;

    await upsertByLookup(
      prisma.categorizationRule,
      { tenant_id: tenant.id, name: rule.name },
      {
        tenant_id: tenant.id,
        category_id: category.id,
        name: rule.name,
        match_text: rule.matchText,
        match_type: rule.matchType,
        priority: rule.priority,
        is_active: true,
        deleted_at: null
      },
      {
        category_id: category.id,
        match_text: rule.matchText,
        match_type: rule.matchType,
        priority: rule.priority,
        is_active: true,
        deleted_at: null
      }
    );
  }

  // Transactions for last 6 months
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const incomeTemplates = [
    { key: 'INCOME:Salário', description: 'Salário', amountMin: 5200, amountMax: 5500, paymentMethod: 'TRANSFER', accountId: nubankAccount.id, day: 5 },
    { key: 'INCOME:Freelance', description: 'Freelance projeto', amountMin: 800, amountMax: 1500, paymentMethod: 'PIX', accountId: nubankAccount.id, day: 18, chance: 0.6 },
    { key: 'INCOME:Rendimentos', description: 'Rendimentos CDB', amountMin: 25, amountMax: 80, paymentMethod: 'TRANSFER', accountId: reserveAccount.id, day: 28, chance: 0.8 }
  ];

  const expenseTemplates = [
    { key: 'EXPENSE:Mercado', description: 'Mercado', amountMin: 450, amountMax: 750, paymentMethod: 'DEBIT_CARD', accountId: nubankAccount.id, day: 8 },
    { key: 'EXPENSE:Alimentação', description: 'Ifood', amountMin: 60, amountMax: 120, paymentMethod: 'CREDIT_CARD', creditCardId: nubankCard.id, day: 11 },
    { key: 'EXPENSE:Transporte', description: 'Uber', amountMin: 30, amountMax: 60, paymentMethod: 'CREDIT_CARD', creditCardId: nubankCard.id, day: 12 },
    { key: 'EXPENSE:Assinaturas', description: 'Netflix', amountMin: 39.90, amountMax: 39.90, paymentMethod: 'CREDIT_CARD', creditCardId: nubankCard.id, day: 13 },
    { key: 'EXPENSE:Assinaturas', description: 'Spotify', amountMin: 19.90, amountMax: 19.90, paymentMethod: 'CREDIT_CARD', creditCardId: mpCard.id, day: 14 },
    { key: 'EXPENSE:Moradia', description: 'Energia', amountMin: 150, amountMax: 220, paymentMethod: 'PIX', accountId: nubankAccount.id, day: 15 },
    { key: 'EXPENSE:Moradia', description: 'Internet', amountMin: 100, amountMax: 120, paymentMethod: 'PIX', accountId: nubankAccount.id, day: 16 },
    { key: 'EXPENSE:Saúde', description: 'Farmácia', amountMin: 40, amountMax: 120, paymentMethod: 'CASH', accountId: walletAccount.id, day: 17 },
    { key: 'EXPENSE:Saúde', description: 'Academia', amountMin: 99.90, amountMax: 109.90, paymentMethod: 'CREDIT_CARD', creditCardId: interCard.id, day: 20 },
    { key: 'EXPENSE:Moradia', description: 'Aluguel', amountMin: 1200, amountMax: 1500, paymentMethod: 'TRANSFER', accountId: nubankAccount.id, day: 10 },
    { key: 'EXPENSE:Lazer', description: 'Cinema e lazer', amountMin: 100, amountMax: 300, paymentMethod: 'CREDIT_CARD', creditCardId: nubankCard.id, day: 22, chance: 0.7 },
    { key: 'EXPENSE:Pets', description: 'Petshop', amountMin: 80, amountMax: 150, paymentMethod: 'DEBIT_CARD', accountId: nubankAccount.id, day: 24, chance: 0.5 },
    { key: 'EXPENSE:Impostos', description: 'Impostos mensais', amountMin: 200, amountMax: 400, paymentMethod: 'PIX', accountId: nubankAccount.id, day: 25, chance: 0.8 }
  ];

  const investmentTemplates = [
    { key: 'INVESTMENT:Reserva de Emergência', description: 'Aporte Reserva CDB', amountMin: 300, amountMax: 600, paymentMethod: 'TRANSFER', accountId: reserveAccount.id, day: 6, chance: 0.9 },
    { key: 'INVESTMENT:Renda Fixa', description: 'Renda Fixa Tesouro', amountMin: 200, amountMax: 500, paymentMethod: 'TRANSFER', accountId: reserveAccount.id, day: 7, chance: 0.7 }
  ];

  function randomAmount(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
  }

  let transactionCount = 0;
  const createdTransactions = [];

  for (const { year, month } of months) {
    for (const template of incomeTemplates) {
      if (template.chance && Math.random() > template.chance) continue;
      const amount = randomAmount(template.amountMin, template.amountMax);
      const externalId = `seed-${year}-${month + 1}-${template.description.toLowerCase().replace(/\s+/g, '-')}`;
      const date = buildDate(year, month, template.day);
      const dayRange = buildDayRange(date);

      const t = await upsertByLookup(
        prisma.transaction,
        {
          OR: [
            { external_id: externalId },
            {
              tenant_id: tenant.id,
              description: template.description,
              amount,
              type: 'INCOME',
              notes: SEED_NOTE,
              transaction_date: { gte: dayRange.start, lte: dayRange.end }
            }
          ]
        },
        {
          tenant_id: tenant.id,
          user_id: demoUser.id,
          account_id: template.accountId || null,
          credit_card_id: template.creditCardId || null,
          category_id: categories[template.key].id,
          description: template.description,
          amount,
          type: 'INCOME',
          status: 'CONFIRMED',
          transaction_date: date,
          payment_method: template.paymentMethod,
          notes: SEED_NOTE,
          source: 'MANUAL',
          external_id: externalId,
          is_recurring: false,
          is_installment: false,
          deleted_at: null
        },
        {
          user_id: demoUser.id,
          account_id: template.accountId || null,
          credit_card_id: template.creditCardId || null,
          category_id: categories[template.key].id,
          amount,
          status: 'CONFIRMED',
          transaction_date: date,
          payment_method: template.paymentMethod,
          notes: SEED_NOTE,
          source: 'MANUAL',
          external_id: externalId,
          is_recurring: false,
          is_installment: false,
          deleted_at: null
        }
      );
      createdTransactions.push(t);
      transactionCount++;
    }

    for (const template of expenseTemplates) {
      if (template.chance && Math.random() > template.chance) continue;
      const amount = randomAmount(template.amountMin, template.amountMax);
      const externalId = `seed-${year}-${month + 1}-${template.description.toLowerCase().replace(/\s+/g, '-')}`;
      const date = buildDate(year, month, template.day);
      const dayRange = buildDayRange(date);

      const t = await upsertByLookup(
        prisma.transaction,
        {
          OR: [
            { external_id: externalId },
            {
              tenant_id: tenant.id,
              description: template.description,
              amount,
              type: 'EXPENSE',
              notes: SEED_NOTE,
              transaction_date: { gte: dayRange.start, lte: dayRange.end }
            }
          ]
        },
        {
          tenant_id: tenant.id,
          user_id: demoUser.id,
          account_id: template.accountId || null,
          credit_card_id: template.creditCardId || null,
          category_id: categories[template.key].id,
          description: template.description,
          amount,
          type: 'EXPENSE',
          status: 'CONFIRMED',
          transaction_date: date,
          payment_method: template.paymentMethod,
          notes: SEED_NOTE,
          source: Math.random() > 0.7 ? 'CSV' : 'MANUAL',
          external_id: externalId,
          is_recurring: false,
          is_installment: false,
          deleted_at: null
        },
        {
          user_id: demoUser.id,
          account_id: template.accountId || null,
          credit_card_id: template.creditCardId || null,
          category_id: categories[template.key].id,
          amount,
          status: 'CONFIRMED',
          transaction_date: date,
          payment_method: template.paymentMethod,
          notes: SEED_NOTE,
          source: Math.random() > 0.7 ? 'CSV' : 'MANUAL',
          external_id: externalId,
          is_recurring: false,
          is_installment: false,
          deleted_at: null
        }
      );
      createdTransactions.push(t);
      transactionCount++;
    }

    for (const template of investmentTemplates) {
      if (template.chance && Math.random() > template.chance) continue;
      const amount = randomAmount(template.amountMin, template.amountMax);
      const externalId = `seed-${year}-${month + 1}-${template.description.toLowerCase().replace(/\s+/g, '-')}`;
      const date = buildDate(year, month, template.day);
      const dayRange = buildDayRange(date);

      const t = await upsertByLookup(
        prisma.transaction,
        {
          OR: [
            { external_id: externalId },
            {
              tenant_id: tenant.id,
              description: template.description,
              amount,
              type: 'INVESTMENT',
              notes: SEED_NOTE,
              transaction_date: { gte: dayRange.start, lte: dayRange.end }
            }
          ]
        },
        {
          tenant_id: tenant.id,
          user_id: demoUser.id,
          account_id: template.accountId || null,
          credit_card_id: template.creditCardId || null,
          category_id: categories[template.key].id,
          description: template.description,
          amount,
          type: 'INVESTMENT',
          status: 'CONFIRMED',
          transaction_date: date,
          payment_method: template.paymentMethod,
          notes: SEED_NOTE,
          source: 'MANUAL',
          external_id: externalId,
          is_recurring: false,
          is_installment: false,
          deleted_at: null
        },
        {
          user_id: demoUser.id,
          account_id: template.accountId || null,
          credit_card_id: template.creditCardId || null,
          category_id: categories[template.key].id,
          amount,
          status: 'CONFIRMED',
          transaction_date: date,
          payment_method: template.paymentMethod,
          notes: SEED_NOTE,
          source: 'MANUAL',
          external_id: externalId,
          is_recurring: false,
          is_installment: false,
          deleted_at: null
        }
      );
      createdTransactions.push(t);
      transactionCount++;
    }
  }

  // Budgets for current month
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const budgetDefinitions = [
    { name: 'Mercado', categoryKey: 'EXPENSE:Mercado', amount: '700.00', used: '650.00' },
    { name: 'Alimentação', categoryKey: 'EXPENSE:Alimentação', amount: '500.00', used: '480.00' },
    { name: 'Transporte', categoryKey: 'EXPENSE:Transporte', amount: '300.00', used: '350.00' },
    { name: 'Assinaturas', categoryKey: 'EXPENSE:Assinaturas', amount: '100.00', used: '59.80' },
    { name: 'Saúde', categoryKey: 'EXPENSE:Saúde', amount: '400.00', used: '380.00' },
    { name: 'Lazer', categoryKey: 'EXPENSE:Lazer', amount: '300.00', used: '200.00' },
    { name: 'Moradia', categoryKey: 'EXPENSE:Moradia', amount: '1800.00', used: '1500.00' }
  ];

  for (const budget of budgetDefinitions) {
    const category = categories[budget.categoryKey];
    if (!category) continue;

    await upsertByLookup(
      prisma.budget,
      { tenant_id: tenant.id, category_id: category.id, month: currentMonth, year: currentYear },
      {
        tenant_id: tenant.id,
        category_id: category.id,
        name: `${budget.name} ${String(currentMonth).padStart(2, '0')}/${currentYear}`,
        amount: budget.amount,
        month: currentMonth,
        year: currentYear,
        deleted_at: null
      },
      {
        name: `${budget.name} ${String(currentMonth).padStart(2, '0')}/${currentYear}`,
        amount: budget.amount,
        deleted_at: null
      }
    );
  }

  // Goals
  const goalDefinitions = [
    { name: 'Reserva de emergência', target: '15000.00', current: '4200.00', deadline: new Date(currentYear, 11, 31), status: 'ACTIVE' },
    { name: 'Comprar notebook', target: '8000.00', current: '2500.00', deadline: new Date(currentYear, 8, 30), status: 'ACTIVE' },
    { name: 'Viagem de férias', target: '12000.00', current: '3000.00', deadline: new Date(currentYear + 1, 1, 28), status: 'ACTIVE' },
    { name: 'Quitar dívida', target: '5000.00', current: '3500.00', deadline: new Date(currentYear, 7, 31), status: 'ACTIVE' },
    { name: 'Investir R$ 10.000', target: '10000.00', current: '10000.00', deadline: new Date(currentYear, 11, 31), status: 'COMPLETED' }
  ];

  for (const goal of goalDefinitions) {
    await upsertByLookup(
      prisma.goal,
      { tenant_id: tenant.id, name: goal.name },
      {
        tenant_id: tenant.id,
        user_id: demoUser.id,
        name: goal.name,
        description: null,
        target_amount: goal.target,
        current_amount: goal.current,
        deadline: goal.deadline,
        status: goal.status,
        deleted_at: null
      },
      {
        user_id: demoUser.id,
        target_amount: goal.target,
        current_amount: goal.current,
        deadline: goal.deadline,
        status: goal.status,
        deleted_at: null
      }
    );
  }

  // Tenant settings
  await upsertByLookup(
    prisma.tenantSettings,
    { tenant_id: tenant.id },
    {
      tenant_id: tenant.id,
      currency: 'BRL',
      financial_month_start_day: 1,
      default_account_id: nubankAccount.id,
      theme: 'system',
      date_format: 'DD/MM/YYYY',
      notify_budget_warning: true,
      notify_budget_exceeded: true,
      notify_invoice_due: true,
      notify_goal_behind: false
    },
    {
      currency: 'BRL',
      financial_month_start_day: 1,
      default_account_id: nubankAccount.id,
      theme: 'system',
      date_format: 'DD/MM/YYYY',
      notify_budget_warning: true,
      notify_budget_exceeded: true,
      notify_invoice_due: true,
      notify_goal_behind: false
    }
  );

  // Plan Limits
  const planLimits = [
    { plan: 'FREE', max_accounts: 1, max_credit_cards: 1, max_users: 1, max_transactions_per_month: 200, can_import: false, can_export_reports: false, can_use_ai: false, can_use_open_finance: false },
    { plan: 'PRO', max_accounts: 5, max_credit_cards: 3, max_users: 3, max_transactions_per_month: 1000, can_import: true, can_export_reports: true, can_use_ai: true, can_use_open_finance: true },
    { plan: 'PREMIUM', max_accounts: 10, max_credit_cards: 5, max_users: 5, max_transactions_per_month: 5000, can_import: true, can_export_reports: true, can_use_ai: true, can_use_open_finance: true },
    { plan: 'FAMILY', max_accounts: 15, max_credit_cards: 10, max_users: 10, max_transactions_per_month: 10000, can_import: true, can_export_reports: true, can_use_ai: true, can_use_open_finance: true }
  ];

  for (const pl of planLimits) {
    await upsertByLookup(
      prisma.planLimit,
      { plan: pl.plan },
      pl,
      pl
    );
  }

  console.log('Seed concluido com sucesso.');
  console.log(`Tenant: ${tenant.name} (${tenant.email})`);
  console.log(`Usuario demo: ${demoUser.email}`);
  console.log(`Usuario admin (SUPER_ADMIN): ${adminUser.email}`);
  console.log(`Categorias globais: ${CATEGORY_DEFINITIONS.length}`);
  console.log('Contas demo: Conta Corrente Nubank, Conta Inter, Carteira, Reserva CDB');
  console.log('Cartoes demo: Cartão Nubank, Cartão Inter, Cartão Mercado Pago');
  console.log(`Transacoes demo: ${transactionCount}`);
  console.log(`Orçamentos demo: ${budgetDefinitions.length}`);
  console.log(`Metas demo: ${goalDefinitions.length}`);
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
