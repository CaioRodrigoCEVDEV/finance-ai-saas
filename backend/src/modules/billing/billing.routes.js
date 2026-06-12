const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const controller = require('./billing.controller');
const validation = require('./billing.validation');

const billingRoutes = Router();

billingRoutes.get('/billing/current', authenticate, controller.getCurrent);
billingRoutes.get('/billing/plans', authenticate, controller.getPlans);
billingRoutes.post('/billing/checkout', authenticate, validation.validateCheckout, controller.checkout);
billingRoutes.post('/billing/customer-portal', authenticate, controller.customerPortal);

module.exports = billingRoutes;
