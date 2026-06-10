const bcrypt = require('bcryptjs');

const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const { signToken } = require('../../services/token-service');

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

function sanitizeTenant(userTenant) {
  return {
    id: userTenant.tenant.id,
    name: userTenant.tenant.name,
    role: userTenant.role,
    plan: userTenant.tenant.plan
  };
}

function pickCurrentTenant(userTenants) {
  return userTenants.find((item) => item.role === 'OWNER') || userTenants[0] || null;
}

async function findUserByEmail(email) {
  return prisma.user.findFirst({
    where: {
      email,
      deleted_at: null,
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      email: true,
      password_hash: true,
      user_tenants: {
        where: {
          tenant: {
            deleted_at: null,
            status: 'ACTIVE'
          }
        },
        orderBy: {
          created_at: 'asc'
        },
        select: {
          role: true,
          tenant: {
            select: {
              id: true,
              name: true,
              plan: true
            }
          }
        }
      }
    }
  });
}

async function findAuthenticatedUser(userId, tenantId) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deleted_at: null,
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      email: true,
      user_tenants: {
        where: {
          tenant_id: tenantId,
          tenant: {
            deleted_at: null,
            status: 'ACTIVE'
          }
        },
        select: {
          role: true,
          tenant: {
            select: {
              id: true,
              name: true,
              plan: true
            }
          }
        }
      }
    }
  });

  if (!user || user.user_tenants.length === 0) {
    throw new AppError('Sessao invalida ou expirada', 401);
  }

  const currentTenant = sanitizeTenant(user.user_tenants[0]);

  return {
    user: sanitizeUser(user),
    tenant: currentTenant
  };
}

async function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new AppError('Email ou senha invalidos', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new AppError('Email ou senha invalidos', 401);
  }

  const currentTenant = pickCurrentTenant(user.user_tenants);

  if (!currentTenant) {
    throw new AppError('Usuario sem tenant ativo vinculado', 403);
  }

  const tenant = sanitizeTenant(currentTenant);
  const token = signToken({
    userId: user.id,
    tenantId: tenant.id,
    role: tenant.role
  });

  return {
    token,
    user: sanitizeUser(user),
    tenant
  };
}

module.exports = {
  findAuthenticatedUser,
  login
};
