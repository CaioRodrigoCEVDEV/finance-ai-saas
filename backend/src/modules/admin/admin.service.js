const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');
const bcrypt = require('bcryptjs');

function sanitizeTenantForAdmin(tenant) {
  const ownerMembership = tenant.user_tenants?.find((ut) => ut.role === 'OWNER') || null;

  return {
    id: tenant.id,
    name: tenant.name,
    email: tenant.email || null,
    plan: tenant.plan,
    status: tenant.status,
    owner: ownerMembership?.user
      ? {
          id: ownerMembership.user.id,
          name: ownerMembership.user.name,
          email: ownerMembership.user.email,
          status: ownerMembership.user.status || null,
          globalRole: ownerMembership.user.global_role || 'USER'
        }
      : null,
    userCount: tenant._count?.user_tenants || 0,
    usersCount: tenant._count?.user_tenants || 0,
    createdAt: tenant.created_at.toISOString(),
    updatedAt: tenant.updated_at.toISOString()
  };
}

function sanitizeUserForAdmin(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url || null,
    status: user.status,
    globalRole: user.global_role,
    createdAt: user.created_at.toISOString(),
    updatedAt: user.updated_at.toISOString(),
    tenants: (user.user_tenants || []).map(ut => ({
      id: ut.tenant.id,
      name: ut.tenant.name,
      role: ut.role
    }))
  };
}

function sanitizeFeedbackForAdmin(feedback) {
  return {
    id: feedback.id,
    tenant: feedback.tenant ? { name: feedback.tenant.name } : null,
    tenantName: feedback.tenant?.name || null,
    user: {
      name: feedback.name,
      email: feedback.email
    },
    userName: feedback.name,
    email: feedback.email,
    message: feedback.message,
    status: feedback.status,
    createdAt: feedback.created_at.toISOString(),
    updatedAt: feedback.updated_at.toISOString()
  };
}

function sanitizeAuditLog(log) {
  return {
    id: log.id,
    action: log.action,
    entity: log.entity,
    entityId: log.entity_id,
    metadata: log.metadata,
    ipAddress: log.ip_address,
    userAgent: log.user_agent,
    userName: log.user?.name || null,
    tenantName: log.tenant?.name || null,
    createdAt: log.created_at.toISOString()
  };
}

// Dashboard

async function getDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalTenants,
    totalUsers,
    totalFreeTenants,
    totalPremiumTenants,
    totalSuspendedTenants,
    newUsersThisMonth,
    newTenantsThisMonth,
    recentlyCreatedTenants,
    recentlyCreatedUsers,
    recentAuditLogs
  ] = await Promise.all([
    prisma.tenant.count({ where: { deleted_at: null } }),
    prisma.user.count({ where: { deleted_at: null } }),
    prisma.tenant.count({ where: { deleted_at: null, plan: 'FREE' } }),
    prisma.tenant.count({ where: { deleted_at: null, plan: { not: 'FREE' } } }),
    prisma.tenant.count({ where: { deleted_at: null, status: { in: ['INACTIVE', 'BLOCKED'] } } }),
    prisma.user.count({ where: { deleted_at: null, created_at: { gte: startOfMonth } } }),
    prisma.tenant.count({ where: { deleted_at: null, created_at: { gte: startOfMonth } } }),
    prisma.tenant.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        _count: { select: { user_tenants: true } },
        user_tenants: {
          where: { role: 'OWNER' },
          take: 1,
          include: { user: { select: { id: true, name: true, email: true, status: true, global_role: true } } }
        }
      }
    }),
    prisma.user.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, global_role: true, status: true, created_at: true }
    }),
    prisma.auditLog.findMany({
      orderBy: { created_at: 'desc' },
      take: 10,
      include: { user: { select: { name: true } }, tenant: { select: { name: true } } }
    })
  ]);

  return {
    totalTenants,
    totalUsers,
    totalFreeTenants,
    totalPremiumTenants,
    totalSuspendedTenants,
    newUsersThisMonth,
    newTenantsThisMonth,
    recentTenants: recentlyCreatedTenants.map(sanitizeTenantForAdmin),
    recentUsers: recentlyCreatedUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      globalRole: u.global_role,
      status: u.status,
      createdAt: u.created_at.toISOString()
    })),
    recentAuditLogs: recentAuditLogs.map(sanitizeAuditLog)
  };
}

// Tenants

async function listTenants(filters = {}) {
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const where = { deleted_at: null };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  if (filters.plan) {
    where.plan = filters.plan;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        _count: { select: { user_tenants: true } },
        user_tenants: {
          where: { role: 'OWNER' },
          take: 1,
          include: { user: { select: { id: true, name: true, email: true, status: true, global_role: true } } }
        }
      }
    }),
    prisma.tenant.count({ where })
  ]);

  return {
    data: tenants.map(sanitizeTenantForAdmin),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
}

async function getTenantDetails(tenantId) {
  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, deleted_at: null },
    include: {
      user_tenants: {
        include: { user: { select: { id: true, name: true, email: true, status: true, avatar_url: true, global_role: true } } },
        orderBy: { created_at: 'asc' }
      },
      _count: {
        select: {
          accounts: true,
          credit_cards: true,
          transactions: true,
          budgets: true,
          goals: true
        }
      }
    }
  });

  if (!tenant) {
    throw new AppError('Workspace nao encontrado', 404);
  }

  const ownerMembership = tenant.user_tenants.find((ut) => ut.role === 'OWNER') || null;

  return {
    id: tenant.id,
    name: tenant.name,
    email: tenant.email || null,
    plan: tenant.plan,
    status: tenant.status,
    createdAt: tenant.created_at.toISOString(),
    updatedAt: tenant.updated_at.toISOString(),
    owner: ownerMembership?.user
      ? {
          id: ownerMembership.user.id,
          name: ownerMembership.user.name,
          email: ownerMembership.user.email,
          status: ownerMembership.user.status,
          globalRole: ownerMembership.user.global_role || 'USER'
        }
      : null,
    users: tenant.user_tenants.map(ut => ({
      id: ut.user.id,
      name: ut.user.name,
      email: ut.user.email,
      role: ut.role,
      status: ut.user.status
    })),
    usage: {
      accounts: tenant._count.accounts,
      accountsCount: tenant._count.accounts,
      creditCards: tenant._count.credit_cards,
      creditCardsCount: tenant._count.credit_cards,
      transactions: tenant._count.transactions,
      transactionsCount: tenant._count.transactions,
      budgets: tenant._count.budgets,
      budgetsCount: tenant._count.budgets,
      goals: tenant._count.goals,
      goalsCount: tenant._count.goals
    }
  };
}

async function updateTenant(tenantId, data) {
  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, deleted_at: null }
  });

  if (!tenant) {
    throw new AppError('Workspace nao encontrado', 404);
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.plan !== undefined) updateData.plan = data.plan;
  if (data.status !== undefined) updateData.status = data.status;

  const updated = await prisma.tenant.update({
    where: { id: tenantId },
    data: updateData,
    select: { id: true, name: true, email: true, plan: true, status: true, created_at: true, updated_at: true }
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email || null,
    plan: updated.plan,
    status: updated.status,
    createdAt: updated.created_at.toISOString(),
    updatedAt: updated.updated_at.toISOString()
  };
}

async function suspendTenant(tenantId) {
  return updateTenant(tenantId, { status: 'INACTIVE' });
}

async function reactivateTenant(tenantId) {
  return updateTenant(tenantId, { status: 'ACTIVE' });
}

// Users

async function listUsers(filters = {}) {
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const where = { deleted_at: null };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.globalRole) {
    where.global_role = filters.globalRole;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        status: true,
        global_role: true,
        created_at: true,
        updated_at: true,
        user_tenants: {
          include: { tenant: { select: { id: true, name: true } } }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  return {
    data: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatar_url || null,
      status: u.status,
      globalRole: u.global_role,
      tenantCount: u.user_tenants.length,
      createdAt: u.created_at.toISOString()
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
}

async function getUserDetails(userId) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deleted_at: null },
    select: {
      id: true,
      name: true,
      email: true,
      avatar_url: true,
      status: true,
      global_role: true,
      created_at: true,
      updated_at: true,
      user_tenants: {
        include: { tenant: { select: { id: true, name: true, plan: true, status: true } } },
        orderBy: { created_at: 'asc' }
      }
    }
  });

  if (!user) {
    throw new AppError('Usuario nao encontrado', 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url || null,
    status: user.status,
    globalRole: user.global_role,
    createdAt: user.created_at.toISOString(),
    updatedAt: user.updated_at.toISOString(),
    tenants: user.user_tenants.map(ut => ({
      id: ut.tenant.id,
      name: ut.tenant.name,
      plan: ut.tenant.plan,
      status: ut.tenant.status,
      role: ut.role
    })),
    memberships: user.user_tenants.map(ut => ({
      id: ut.id,
      role: ut.role,
      tenant: {
        id: ut.tenant.id,
        name: ut.tenant.name,
        plan: ut.tenant.plan,
        status: ut.tenant.status
      }
    }))
  };
}

async function updateUser(userId, data) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deleted_at: null }
  });

  if (!user) {
    throw new AppError('Usuario nao encontrado', 404);
  }

  const updateData = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.status !== undefined) updateData.status = data.status;

  if (data.globalRole !== undefined) {
    if (data.globalRole !== 'SUPER_ADMIN' && user.global_role === 'SUPER_ADMIN') {
      const superAdminCount = await prisma.user.count({
        where: { deleted_at: null, global_role: 'SUPER_ADMIN' }
      });

      if (superAdminCount <= 1) {
        throw new AppError('Nao e possivel remover o ultimo SUPER_ADMIN', 400);
      }
    }

    updateData.global_role = data.globalRole;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      avatar_url: true,
      status: true,
      global_role: true,
      created_at: true,
      updated_at: true
    }
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    avatarUrl: updated.avatar_url || null,
    status: updated.status,
    globalRole: updated.global_role,
    createdAt: updated.created_at.toISOString(),
    updatedAt: updated.updated_at.toISOString()
  };
}

async function blockUser(userId) {
  return updateUser(userId, { status: 'BLOCKED' });
}

async function unblockUser(userId) {
  return updateUser(userId, { status: 'ACTIVE' });
}

async function resetUserPassword(userId, newPassword) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deleted_at: null }
  });

  if (!user) {
    throw new AppError('Usuario nao encontrado', 404);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password_hash: passwordHash }
  });

  return { message: 'Senha redefinida com sucesso' };
}

// Plan Limits

async function listPlanLimits() {
  const limits = await prisma.planLimit.findMany({
    orderBy: { plan: 'asc' }
  });

  return limits.map(l => ({
    id: l.id,
    plan: l.plan,
    maxAccounts: l.max_accounts,
    maxCreditCards: l.max_credit_cards,
    maxUsers: l.max_users,
    maxTransactionsPerMonth: l.max_transactions_per_month,
    canImport: l.can_import,
    canExportReports: l.can_export_reports,
    canUseAi: l.can_use_ai,
    canUseOpenFinance: l.can_use_open_finance,
    updatedAt: l.updated_at.toISOString()
  }));
}

async function getPlanLimit(plan) {
  const limit = await prisma.planLimit.findUnique({ where: { plan } });

  if (!limit) {
    throw new AppError('Plano nao encontrado', 404);
  }

  return {
    id: limit.id,
    plan: limit.plan,
    maxAccounts: limit.max_accounts,
    maxCreditCards: limit.max_credit_cards,
    maxUsers: limit.max_users,
    maxTransactionsPerMonth: limit.max_transactions_per_month,
    canImport: limit.can_import,
    canExportReports: limit.can_export_reports,
    canUseAi: limit.can_use_ai,
    canUseOpenFinance: limit.can_use_open_finance,
    updatedAt: limit.updated_at.toISOString()
  };
}

async function updatePlanLimit(plan, data) {
  const existing = await prisma.planLimit.findUnique({ where: { plan } });

  if (!existing) {
    throw new AppError('Plano nao encontrado', 404);
  }

  const updateData = {};
  if (data.maxAccounts !== undefined) updateData.max_accounts = data.maxAccounts;
  if (data.maxCreditCards !== undefined) updateData.max_credit_cards = data.maxCreditCards;
  if (data.maxUsers !== undefined) updateData.max_users = data.maxUsers;
  if (data.maxTransactionsPerMonth !== undefined) updateData.max_transactions_per_month = data.maxTransactionsPerMonth;
  if (data.canImport !== undefined) updateData.can_import = data.canImport;
  if (data.canExportReports !== undefined) updateData.can_export_reports = data.canExportReports;
  if (data.canUseAi !== undefined) updateData.can_use_ai = data.canUseAi;
  if (data.canUseOpenFinance !== undefined) updateData.can_use_open_finance = data.canUseOpenFinance;

  const updated = await prisma.planLimit.update({
    where: { plan },
    data: updateData
  });

  return {
    id: updated.id,
    plan: updated.plan,
    maxAccounts: updated.max_accounts,
    maxCreditCards: updated.max_credit_cards,
    maxUsers: updated.max_users,
    maxTransactionsPerMonth: updated.max_transactions_per_month,
    canImport: updated.can_import,
    canExportReports: updated.can_export_reports,
    canUseAi: updated.can_use_ai,
    canUseOpenFinance: updated.can_use_open_finance,
    updatedAt: updated.updated_at.toISOString()
  };
}

// Feedbacks (admin)

async function listAllFeedbacks(filters = {}) {
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.tenantId) {
    where.tenant_id = filters.tenantId;
  }

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: { tenant: { select: { name: true } } }
    }),
    prisma.feedback.count({ where })
  ]);

  return {
    data: feedbacks.map(sanitizeFeedbackForAdmin),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
}

async function getAdminFeedback(feedbackId) {
  const feedback = await prisma.feedback.findFirst({
    where: { id: feedbackId },
    include: { tenant: { select: { name: true } } }
  });

  if (!feedback) {
    throw new AppError('Feedback nao encontrado', 404);
  }

  return sanitizeFeedbackForAdmin(feedback);
}

async function updateAdminFeedback(feedbackId, data) {
  const feedback = await prisma.feedback.findFirst({
    where: { id: feedbackId }
  });

  if (!feedback) {
    throw new AppError('Feedback nao encontrado', 404);
  }

  const updateData = {};
  if (data.status !== undefined) updateData.status = data.status;

  const updated = await prisma.feedback.update({
    where: { id: feedbackId },
    data: updateData,
    include: { tenant: { select: { name: true } } }
  });

  return sanitizeFeedbackForAdmin(updated);
}

// Audit Logs

async function listAuditLogs(filters = {}) {
  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const where = {};

  if (filters.tenantId) {
    where.tenant_id = filters.tenantId;
  }

  if (filters.userId) {
    where.user_id = filters.userId;
  }

  if (filters.search) {
    where.action = { contains: filters.search, mode: 'insensitive' };
  } else if (filters.action) {
    where.action = filters.action;
  }

  if (filters.entityType) {
    where.entity = filters.entityType;
  } else if (filters.entity) {
    where.entity = filters.entity;
  }

  if (filters.startDate || filters.endDate) {
    where.created_at = {};
    if (filters.startDate) where.created_at.gte = new Date(filters.startDate);
    if (filters.endDate) where.created_at.lte = new Date(filters.endDate);
  }

  const [auditLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
        tenant: { select: { name: true } }
      }
    }),
    prisma.auditLog.count({ where })
  ]);

  return {
    data: auditLogs.map(log => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityType: log.entity,
      entityId: log.entity_id,
      metadata: log.metadata,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      user: log.user
        ? { name: log.user.name, email: log.user.email }
        : null,
      userName: log.user?.name || null,
      userEmail: log.user?.email || null,
      tenant: log.tenant ? { name: log.tenant.name } : null,
      tenantName: log.tenant?.name || null,
      createdAt: log.created_at.toISOString()
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
}

module.exports = {
  getDashboard,
  listTenants,
  getTenantDetails,
  updateTenant,
  suspendTenant,
  reactivateTenant,
  listUsers,
  getUserDetails,
  updateUser,
  blockUser,
  unblockUser,
  resetUserPassword,
  listPlanLimits,
  getPlanLimit,
  updatePlanLimit,
  listAllFeedbacks,
  getAdminFeedback,
  updateAdminFeedback,
  listAuditLogs
};
