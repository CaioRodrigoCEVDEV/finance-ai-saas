const crypto = require('crypto');
const prisma = require('../../config/prisma');
const env = require('../../config/env');
const AppError = require('../../utils/app-error');
const { ALLOWED_TARGET_PATHS } = require('./invites.validation');

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomBytes = crypto.randomBytes(6);
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return `FIN-${result}`;
}

function toInviteResponse(invite) {
  return {
    id: invite.id,
    code: invite.code,
    title: invite.title,
    targetPath: invite.targetPath,
    status: invite.status,
    clicks: invite.clicks,
    signups: invite.signups,
    lastClickAt: invite.lastClickAt ? invite.lastClickAt.toISOString() : null,
    expiresAt: invite.expiresAt ? invite.expiresAt.toISOString() : null,
    createdAt: invite.createdAt.toISOString(),
    inviteUrl: `${env.frontendUrl}/?ref=${invite.code}`
  };
}

async function listInvites(tenantId, userId) {
  const where = {
    deletedAt: null,
    userId
  };

  if (tenantId) {
    where.tenantId = tenantId;
  }

  const invites = await prisma.referralInvite.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  return invites.map(toInviteResponse);
}

async function createInvite(data, tenantId, userId) {
  const targetPath = data.targetPath || '/';

  if (!ALLOWED_TARGET_PATHS.includes(targetPath)) {
    throw new AppError('Destino invalido', 400);
  }

  let code;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = generateCode();
    const existing = await prisma.referralInvite.findUnique({ where: { code } });
    if (!existing) break;
    attempts++;
    if (attempts >= maxAttempts) {
      throw new AppError('Nao foi possivel gerar um codigo unico. Tente novamente.', 500);
    }
  } while (true);

  const invite = await prisma.referralInvite.create({
    data: {
      tenantId,
      userId,
      code,
      title: data.title ?? null,
      targetPath,
      expiresAt: data.expiresAt ?? null,
      status: 'ACTIVE'
    }
  });

  return toInviteResponse(invite);
}

async function updateInviteStatus(inviteId, status, tenantId, userId) {
  const where = {
    id: inviteId,
    userId,
    deletedAt: null
  };

  if (tenantId) {
    where.tenantId = tenantId;
  }

  const invite = await prisma.referralInvite.findFirst({ where });

  if (!invite) {
    throw new AppError('Convite nao encontrado', 404);
  }

  const updatedInvite = await prisma.referralInvite.update({
    where: { id: invite.id },
    data: { status }
  });

  return toInviteResponse(updatedInvite);
}

async function deleteInvite(inviteId, tenantId, userId) {
  const where = {
    id: inviteId,
    userId,
    deletedAt: null
  };

  if (tenantId) {
    where.tenantId = tenantId;
  }

  const invite = await prisma.referralInvite.findFirst({ where });

  if (!invite) {
    throw new AppError('Convite nao encontrado', 404);
  }

  await prisma.referralInvite.update({
    where: { id: invite.id },
    data: { deletedAt: new Date() }
  });

  return { message: 'Convite excluido com sucesso' };
}

async function trackInvite(code) {
  const invite = await prisma.referralInvite.findUnique({
    where: { code }
  });

  if (!invite || invite.deletedAt) {
    return {
      valid: false,
      targetPath: '/',
      message: 'Convite invalido ou expirado.'
    };
  }

  if (invite.status !== 'ACTIVE') {
    return {
      valid: false,
      targetPath: invite.targetPath,
      message: 'Convite invalido ou expirado.'
    };
  }

  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return {
      valid: false,
      targetPath: invite.targetPath,
      message: 'Convite invalido ou expirado.'
    };
  }

  await prisma.referralInvite.update({
    where: { id: invite.id },
    data: {
      clicks: { increment: 1 },
      lastClickAt: new Date()
    }
  });

  return {
    valid: true,
    targetPath: invite.targetPath,
    message: 'Convite registrado com sucesso.'
  };
}

module.exports = {
  listInvites,
  createInvite,
  updateInviteStatus,
  deleteInvite,
  trackInvite
};
