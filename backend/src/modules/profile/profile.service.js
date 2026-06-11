const bcrypt = require('bcryptjs');

const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

function sanitizeProfileUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

async function getProfile(userId, tenantId) {
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
      created_at: true,
      updated_at: true,
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
    throw new AppError('Usuário não encontrado', 404);
  }

  const membership = user.user_tenants[0];
  const tenant = membership.tenant;

  return {
    user: sanitizeProfileUser(user),
    tenant: {
      id: tenant.id,
      name: tenant.name,
      plan: tenant.plan
    },
    membership: {
      role: membership.role
    }
  };
}

async function updateProfile(userId, data) {
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      deleted_at: null,
      status: 'ACTIVE'
    }
  });

  if (!existingUser) {
    throw new AppError('Usuário não encontrado', 404);
  }

  if (data.email && data.email !== existingUser.email) {
    const emailTaken = await prisma.user.findFirst({
      where: {
        email: data.email,
        id: { not: userId },
        deleted_at: null
      }
    });

    if (emailTaken) {
      throw new AppError('Este e-mail já está em uso', 409);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email
    },
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true,
      updated_at: true
    }
  });

  return sanitizeProfileUser(updatedUser);
}

async function updatePassword(userId, currentPassword, newPassword, confirmPassword) {
  if (newPassword !== confirmPassword) {
    throw new AppError('As senhas não conferem', 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deleted_at: null,
      status: 'ACTIVE'
    },
    select: {
      id: true,
      password_hash: true
    }
  });

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isPasswordValid) {
    throw new AppError('A senha atual está incorreta', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password_hash: hashedPassword }
  });

  return { message: 'Senha alterada com sucesso' };
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword
};
