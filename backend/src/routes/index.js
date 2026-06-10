const { Router } = require('express');

const healthRoutes = require('./health-routes');
const authRoutes = require('../modules/auth/auth.routes');
const accountsRoutes = require('../modules/accounts/accounts.routes');
const categoriesRoutes = require('../modules/categories/categories.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard-routes');
const transactionsRoutes = require('../modules/transactions/transactions.routes');

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(accountsRoutes);
router.use(categoriesRoutes);
router.use(dashboardRoutes);
router.use(transactionsRoutes);

module.exports = router;
