const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const controller = require('./push-subscription-controller');
const validation = require('./push-subscription-validation');

const pushRoutes = Router();

pushRoutes.use('/push', authenticate);

pushRoutes.post('/push/subscribe', requireWrite, validation.validateSubscribe, controller.subscribe);
pushRoutes.delete('/push/unsubscribe', requireWrite, validation.validateUnsubscribe, controller.unsubscribe);
pushRoutes.post('/push/test', requireWrite, controller.testPush);

module.exports = pushRoutes;
