const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

async function updateCurrentTenant(tenantId, name) {
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
      deleted_at: null,
      status: 'ACTIVE'
    }
  });

  if (!tenant) {
    throw new AppError('Workspace nao encontrado', 404);
  }

  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: { name },
    select: {
      id: true,
      name: true,
      plan: true
    }
  });

  return updatedTenant;
}

module.exports = {
  updateCurrentTenant
};
