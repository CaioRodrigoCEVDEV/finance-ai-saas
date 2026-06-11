const tenantsService = require('./tenants.service');

async function updateCurrent(request, response, next) {
  try {
    const updatedTenant = await tenantsService.updateCurrentTenant(request.tenant.id, request.body.name);
    return response.json({ tenant: updatedTenant, message: 'Workspace atualizado com sucesso' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  updateCurrent
};
