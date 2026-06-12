const express = require('express');

const controller = require('./billing.controller');

const webhookRoutes = express.Router();

webhookRoutes.post('/webhooks/stripe', express.raw({ type: 'application/json' }), controller.stripeWebhook);
webhookRoutes.post('/webhooks/mercado-pago', express.json({ limit: '1mb' }), controller.mercadoPagoWebhook);

module.exports = webhookRoutes;
