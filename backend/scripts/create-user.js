require('dotenv/config');

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient({ errorFormat: 'minimal' });

const VALID_ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'READONLY'];
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

function validateEmail(email) {
  if (!email || !email.includes('@') || email.length < 5) {
    throw new Error('Email invalido. Forneca um email valido com --email.');
  }
  return email.trim().toLowerCase();
}

function validatePassword(password) {
  if (!password || password.length < 6) {
    throw new Error('Senha invalida. A senha deve ter no minimo 6 caracteres.');
  }
  return password;
}

function validateRequired(value, name) {
  if (!value || value.trim().length === 0) {
    throw new Error(`O campo --${name} e obrigatorio.`);
  }
  return value.trim();
}

async function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question + ' (s/N): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim');
    });
  });
}

async function main() {
  try {
    const args = parseArgs();

    const name = validateRequired(args.name, 'name');
    const rawEmail = validateRequired(args.email, 'email');
    const email = validateEmail(rawEmail);
    const password = validatePassword(args.password);
    const tenantName = validateRequired(args.tenant, 'tenant');
    const role = (args.role || 'OWNER').toUpperCase();
    const plan = (args.plan || 'PREMIUM').toUpperCase();

    if (!VALID_ROLES.includes(role)) {
      throw new Error(`Role invalida. Use uma das opcoes: ${VALID_ROLES.join(', ')}`);
    }
    if (!VALID_PLANS.includes(plan)) {
      throw new Error(`Plan invalido. Use uma das opcoes: ${VALID_PLANS.join(', ')}`);
    }

    console.log('\n--- Finance AI — Criacao de Usuario e Tenant ---\n');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      console.log(`Atencao: Usuario com email ${email} ja existe.`);
      const confirmed = await askConfirmation('Deseja sobrescrever a senha deste usuario?');
      if (confirmed) {
        const passwordHash = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name,
            password_hash: passwordHash,
            status: 'ACTIVE',
            deleted_at: null
          }
        });
        console.log('Senha atualizada com sucesso.');
      } else {
        console.log('Senha mantida. Prosseguindo com os dados existentes...');
      }
    }

    // Create or get user
    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: { name, status: 'ACTIVE', deleted_at: null }
        })
      : await prisma.user.create({
          data: {
            name,
            email,
            password_hash: await bcrypt.hash(password, 10),
            status: 'ACTIVE'
          }
        });

    // Create or get tenant
    let tenant = await prisma.tenant.findFirst({
      where: { name: tenantName, deleted_at: null }
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: tenantName,
          status: 'ACTIVE',
          plan
        }
      });
      console.log(`Tenant "${tenantName}" criado com plano ${plan}.`);
    } else {
      console.log(`Tenant "${tenantName}" ja existe.`);
    }

    // Create or get UserTenant relationship
    const existingRelation = await prisma.userTenant.findUnique({
      where: {
        user_id_tenant_id: {
          user_id: user.id,
          tenant_id: tenant.id
        }
      }
    });

    if (existingRelation) {
      if (existingRelation.role !== role) {
        await prisma.userTenant.update({
          where: { id: existingRelation.id },
          data: { role }
        });
        console.log(`Role do usuario no tenant atualizada para ${role}.`);
      } else {
        console.log('Relacionamento UserTenant ja existe com a mesma role.');
      }
    } else {
      await prisma.userTenant.create({
        data: {
          user_id: user.id,
          tenant_id: tenant.id,
          role
        }
      });
      console.log(`Usuario vinculado ao tenant com role ${role}.`);
    }

    // Ensure global categories exist for the new tenant
    const globalCount = await prisma.category.count({
      where: { tenant_id: null, is_default: true, deleted_at: null }
    });

    if (globalCount === 0) {
      console.log('\nAviso: Nenhuma categoria global encontrada no banco.');
      console.log('Execute npm run prisma:seed para criar categorias padrao.');
    }

    console.log('\n============================================');
    console.log('  Usuario criado com sucesso.');
    console.log('============================================');
    console.log(`  Nome:   ${name}`);
    console.log(`  Email:  ${email}`);
    console.log(`  Tenant: ${tenantName}`);
    console.log(`  Role:   ${role}`);
    console.log(`  Plano:  ${plan}`);
    console.log('============================================\n');
  } catch (error) {
    console.error('\n Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
