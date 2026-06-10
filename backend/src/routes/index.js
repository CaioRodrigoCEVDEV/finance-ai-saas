const { Router } = require('express');

const healthRoutes = require('./health-routes');
const dashboardRoutes = require('../modules/dashboard/dashboard-routes');

const router = Router();

router.use(healthRoutes);
router.use(dashboardRoutes);

module.exports = router;
