const { Router } = require('express');

const healthRoutes = require('./health-routes');
const authRoutes = require('../modules/auth/auth.routes');
const accountsRoutes = require('../modules/accounts/accounts.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard-routes');

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(accountsRoutes);
router.use(dashboardRoutes);

module.exports = router;
