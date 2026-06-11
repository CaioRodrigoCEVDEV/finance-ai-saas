const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireOwnerOrAdmin } = require('../../middlewares/authorize');
const tenantsController = require('./tenants.controller');
const { validateUpdateCurrentTenant } = require('./tenants.validation');

const tenantsRoutes = Router();

tenantsRoutes.use('/tenants', authenticate);

tenantsRoutes.put('/tenants/current', requireOwnerOrAdmin, validateUpdateCurrentTenant, tenantsController.updateCurrent);

module.exports = tenantsRoutes;
