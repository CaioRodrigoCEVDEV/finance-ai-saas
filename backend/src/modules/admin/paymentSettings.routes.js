const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const requireSuperAdmin = require('../../middlewares/require-super-admin');
const controller = require('./paymentSettings.controller');
const validation = require('./paymentSettings.validation');

const paymentSettingsRoutes = Router();

paymentSettingsRoutes.use('/admin', authenticate, requireSuperAdmin);

paymentSettingsRoutes.get('/admin/payment-settings', controller.getPaymentSettings);
paymentSettingsRoutes.patch('/admin/payment-settings/stripe', validation.validateStripeSettings, controller.updateStripeSettings);
paymentSettingsRoutes.patch('/admin/payment-settings/mercado-pago', validation.validateMercadoPagoSettings, controller.updateMercadoPagoSettings);
paymentSettingsRoutes.post('/admin/payment-settings/stripe/test', controller.testStripeSettings);
paymentSettingsRoutes.post('/admin/payment-settings/mercado-pago/test', controller.testMercadoPagoSettings);
paymentSettingsRoutes.patch('/admin/payment-settings/plans', validation.validateBillingPlans, controller.updateBillingPlans);
paymentSettingsRoutes.get('/admin/payment-events', validation.validatePaymentEventsQuery, controller.listPaymentEvents);

module.exports = paymentSettingsRoutes;
