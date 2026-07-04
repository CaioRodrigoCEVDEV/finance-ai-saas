const pushService = require('./push-subscription-service');

async function subscribe(request, response, next) {
  try {
    const data = await pushService.subscribe(request.tenant.id, request.user?.id, request.body);
    return response.status(201).json(data);
  } catch (error) {
    return next(error);
  }
}

async function unsubscribe(request, response, next) {
  try {
    const data = await pushService.unsubscribe(request.tenant.id, request.body.endpoint);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function testPush(request, response, next) {
  try {
    const sent = await pushService.sendPushToTenant(
      request.tenant.id,
      'Notificacao de teste',
      'Esta e uma notificacao de teste do Finance AI.',
      '/financial-tasks'
    );
    return response.json({ sent, message: `${sent} notificacao(oes) enviada(s)` });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  subscribe,
  unsubscribe,
  testPush
};
