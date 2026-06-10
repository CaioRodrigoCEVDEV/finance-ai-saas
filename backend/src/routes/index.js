const { Router } = require('express');

const healthRoutes = require('./health-routes');
const authRoutes = require('../modules/auth/auth.routes');
const accountsRoutes = require('../modules/accounts/accounts.routes');
const categoriesRoutes = require('../modules/categories/categories.routes');
const creditCardsRoutes = require('../modules/credit-cards/credit-cards.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard-routes');
const transactionsRoutes = require('../modules/transactions/transactions.routes');
const budgetsRoutes = require('../modules/budgets/budgets.routes');
const goalsRoutes = require('../modules/goals/goals.routes');
const importsRoutes = require('../modules/imports/imports.routes');

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(accountsRoutes);
router.use(categoriesRoutes);
router.use(creditCardsRoutes);
router.use(dashboardRoutes);
router.use(transactionsRoutes);
router.use(budgetsRoutes);
router.use(goalsRoutes);
router.use(importsRoutes);

module.exports = router;
