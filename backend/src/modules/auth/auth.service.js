const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const { signToken } = require('../../services/token-service');
const { sendVerificationEmail, sendVerificationSuccessEmail } = require('../../services/email-service');

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url || null,
    globalRole: user.global_role || 'USER',
    emailVerified: user.email_verified || false
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

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
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
      avatar_url: true,
      password_hash: true,
      global_role: true,
      email_verified: true,
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
      avatar_url: true,
      global_role: true,
      email_verified: true,
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

  if (!user.email_verified) {
    throw new AppError(
      'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
      403,
      'EMAIL_NOT_VERIFIED'
    );
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

async function register({ name, email, password, workspaceName }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findFirst({
    where: { email: normalizedEmail, deleted_at: null }
  });

  if (existingUser) {
    throw new AppError(
      'Já existe uma conta cadastrada com este e-mail.',
      409,
      'EMAIL_ALREADY_EXISTS'
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const tenantName = (workspaceName && workspaceName.trim())
    ? workspaceName.trim()
    : `Workspace de ${name.trim()}`;

  const verificationToken = generateVerificationToken();
  const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        status: 'ACTIVE',
        email_verified: false,
        verification_token: verificationToken,
        verification_expires_at: verificationExpiresAt
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true
      }
    });

    const tenant = await tx.tenant.create({
      data: {
        name: tenantName,
        plan: 'FREE',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        plan: true
      }
    });

    await tx.userTenant.create({
      data: {
        user_id: user.id,
        tenant_id: tenant.id,
        role: 'OWNER'
      }
    });

    return { user, tenant };
  });

  await sendVerificationEmail(result.user.email, result.user.name, verificationToken);

  return {
    message: 'Conta criada com sucesso. Enviamos um e-mail de confirmacao para voce.',
    email: result.user.email
  };
}

async function verifyEmail(token) {
  const user = await prisma.user.findFirst({
    where: {
      verification_token: token,
      deleted_at: null,
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      email: true,
      email_verified: true,
      verification_expires_at: true
    }
  });

  if (!user) {
    throw new AppError('Link de verificacao invalido.', 400, 'INVALID_VERIFICATION_TOKEN');
  }

  if (user.email_verified) {
    return { message: 'E-mail ja confirmado. Faca login para continuar.' };
  }

  if (user.verification_expires_at && new Date() > user.verification_expires_at) {
    throw new AppError('Link de verificacao expirado. Solicite um novo.', 400, 'VERIFICATION_TOKEN_EXPIRED');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      email_verified: true,
      email_verified_at: new Date(),
      verification_token: null,
      verification_expires_at: null
    }
  });

  await sendVerificationSuccessEmail(user.email, user.name);

  return { message: 'E-mail confirmado com sucesso! Agora voce ja pode entrar.' };
}

async function resendVerification(email) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      deleted_at: null,
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      email: true,
      email_verified: true
    }
  });

  if (!user) {
    throw new AppError('Nenhuma conta encontrada com este e-mail.', 404, 'USER_NOT_FOUND');
  }

  if (user.email_verified) {
    throw new AppError('Este e-mail ja foi confirmado. Faca login.', 400, 'EMAIL_ALREADY_VERIFIED');
  }

  const verificationToken = generateVerificationToken();
  const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verification_token: verificationToken,
      verification_expires_at: verificationExpiresAt
    }
  });

  await sendVerificationEmail(user.email, user.name, verificationToken);

  return { message: 'Novo e-mail de confirmacao enviado. Verifique sua caixa de entrada.' };
}

module.exports = {
  findAuthenticatedUser,
  login,
  register,
  verifyEmail,
  resendVerification
};
