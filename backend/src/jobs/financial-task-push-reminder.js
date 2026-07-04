const prisma = require('../config/prisma');
const pushService = require('../modules/push-subscriptions/push-subscription-service');

const CHECK_INTERVAL = 60 * 1000;
let intervalId = null;

async function checkPushReminders() {
  try {
    const now = new Date();

    const tasks = await prisma.financialTask.findMany({
      where: {
        reminderAt: { lte: now },
        notificationSent: false,
        status: { not: 'COMPLETED' },
        deletedAt: null
      }
    });

    for (const task of tasks) {
      const title = task.title;
      const body = task.description
        ? `${task.description}\n\nVencimento: ${task.dueDate ? task.dueDate.toLocaleDateString('pt-BR') : 'Nao definido'}`
        : `Sua tarefa financeira esta vencendo.${task.dueDate ? `\nVencimento: ${task.dueDate.toLocaleDateString('pt-BR')}` : ''}`;

      const sent = await pushService.sendPushToTenant(
        task.tenantId,
        title,
        body,
        `/financial-tasks?id=${task.id}`
      );

      if (sent > 0) {
        console.log(`[PushReminder] Push enviado para tarefa ${task.id} (${sent} dispositivo(s))`);
      }

      await prisma.financialTask.update({
        where: { id: task.id },
        data: { notificationSent: true }
      });
    }

    if (tasks.length > 0) {
      console.log(`[PushReminder] ${tasks.length} lembrete(s) processado(s)`);
    }
  } catch (error) {
    console.error('[PushReminder] Erro:', error.message);
  }
}

function start() {
  if (intervalId) return;
  console.log('[PushReminder] Iniciado (intervalo: 1min)');
  checkPushReminders();
  intervalId = setInterval(checkPushReminders, CHECK_INTERVAL);
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[PushReminder] Parado');
  }
}

module.exports = { start, stop };
