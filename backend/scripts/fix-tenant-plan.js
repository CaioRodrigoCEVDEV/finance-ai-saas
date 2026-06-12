require('dotenv/config');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ errorFormat: 'minimal' });

const VALID_PLANS = ['FREE', 'PRO', 'PREMIUM', 'FAMILY'];

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : null;
      if (value !== null) i++;
      parsed[key] = value;
    }
  }

  return parsed;
}

async function main() {
  try {
    const args = parseArgs();
    const email = args.email?.trim().toLowerCase();
    const tenantId = args.id;
    const plan = (args.plan || '').toUpperCase();

    if (!email && !tenantId) {
      console.log('\nUso: node scripts/fix-tenant-plan.js --email <email> --plan <PLAN>');
      console.log('  ou: node scripts/fix-tenant-plan.js --id <tenant-id> --plan <PLAN>');
      console.log('\nExemplo:');
      console.log('  node scripts/fix-tenant-plan.js --email demo@financeai.com --plan FREE\n');
      process.exit(1);
    }

    if (!plan || !VALID_PLANS.includes(plan)) {
      console.error(`\nErro: Plano invalido. Use: ${VALID_PLANS.join(', ')}\n`);
      process.exit(1);
    }

    const where = email ? { email } : { id: tenantId };
    const tenant = await prisma.tenant.findFirst({ where });

    if (!tenant) {
      console.error('\nErro: Tenant nao encontrado.\n');
      process.exit(1);
    }

    if (tenant.plan === plan) {
      console.log(`\nTenant "${tenant.name}" ja esta no plano ${plan}. Nenhuma alteracao necessaria.\n`);
      process.exit(0);
    }

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { plan }
    });

    console.log(`\nTenant "${tenant.name}" alterado de ${tenant.plan} para ${plan} com sucesso.\n`);
  } catch (error) {
    console.error('\nErro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
