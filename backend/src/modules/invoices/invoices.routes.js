const { Router } = require('express');
const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const controller = require('./invoices.controller');
const { validateListQuery, validateParams, validateGenerate, validatePay } = require('./invoices.validation');

const routes = Router();

routes.use('/invoices', authenticate);

routes.get('/invoices', validateListQuery, controller.listInvoices);
routes.get('/invoices/current', controller.getCurrentInvoices);
routes.get('/invoices/summary', controller.getInvoiceSummary);
routes.get('/invoices/:id', validateParams, controller.getInvoice);
routes.post('/invoices/generate', requireWrite, validateGenerate, controller.generateInvoice);
routes.post('/invoices/:id/recalculate', requireWrite, validateParams, controller.recalculateInvoice);
routes.post('/invoices/:id/pay', requireWrite, validateParams, validatePay, controller.payInvoice);
routes.post('/invoices/:id/cancel-payment', requireWrite, validateParams, controller.cancelInvoicePayment);

module.exports = routes;
