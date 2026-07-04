const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

async function subscribe(tenantId, userId, data) {
  const existing = await prisma.pushSubscription.findUnique({
    where: {
      tenantId_endpoint: {
        tenantId,
        endpoint: data.endpoint
      }
    }
  });

  if (existing) {
    return { message: 'Inscricao ja existente' };
  }

  await prisma.pushSubscription.create({
    data: {
      tenantId,
      userId: userId || null,
      endpoint: data.endpoint,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth
    }
  });

  return { message: 'Inscricao realizada com sucesso' };
}

async function unsubscribe(tenantId, endpoint) {
  const sub = await prisma.pushSubscription.findUnique({
    where: {
      tenantId_endpoint: { tenantId, endpoint }
    }
  });

  if (!sub) {
    throw new AppError('Inscricao nao encontrada', 404);
  }

  await prisma.pushSubscription.delete({
    where: { id: sub.id }
  });

  return { message: 'Inscricao removida com sucesso' };
}

async function sendPushToTenant(tenantId, title, body, url) {
  const subs = await prisma.pushSubscription.findMany({
    where: { tenantId }
  });

  if (subs.length === 0) {
    return 0;
  }

  const webpush = require('web-push');

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('[PushService] VAPID keys not configured, skipping push');
    return 0;
  }

  webpush.setVapidDetails(
    'mailto:noreply@financeai.app',
    vapidPublicKey,
    vapidPrivateKey
  );

  let sent = 0;

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        JSON.stringify({ title, body, url: url || '/' }),
        { TTL: 86400 }
      );
      sent += 1;
    } catch (error) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }

  return sent;
}

module.exports = {
  subscribe,
  unsubscribe,
  sendPushToTenant
};
