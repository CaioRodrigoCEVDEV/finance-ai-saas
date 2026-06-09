const { Router } = require('express');

const { getHealth } = require('../controllers/health-controller');

const healthRoutes = Router();

healthRoutes.get('/health', getHealth);

module.exports = healthRoutes;
