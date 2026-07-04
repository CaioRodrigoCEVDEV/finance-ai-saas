const prisma = require('../config/prisma');

const CHECK_INTERVAL = 5 * 60 * 1000;
const NOTIFICATION_TITLE = 'Lembrete de tarefa financeira';

let intervalId = null;

async function checkReminders() {
  try {
    const now = new Date();

    const tasks = await prisma.financialTask.findMany({
      where: {
        reminderAt: { lte: now },
        notificationSent: false,
        status: { not: 'COMPLETED' },
        deletedAt: null
      },
      include: {
        tenant: true
      }
    });

    for (const task of tasks) {
      await prisma.notification.create({
        data: {
          tenant_id: task.tenantId,
          title: NOTIFICATION_TITLE,
          message: `${task.title}${task.dueDate ? ` — vence em ${task.dueDate.toLocaleDateString('pt-BR')}` : ''}`,
          type: 'TASK_REMINDER',
          reference_id: task.id,
          reference_type: 'FINANCIAL_TASK'
        }
      });

      await prisma.financialTask.update({
        where: { id: task.id },
        data: { notificationSent: true }
      });
    }

    if (tasks.length > 0) {
      console.log(`[ReminderJob] ${tasks.length} lembrete(s) enviado(s)`);
    }
  } catch (error) {
    console.error('[ReminderJob] Erro ao verificar lembretes:', error.message);
  }
}

function start() {
  if (intervalId) {
    return;
  }

  console.log('[ReminderJob] Iniciado (intervalo: 5min)');
  checkReminders();
  intervalId = setInterval(checkReminders, CHECK_INTERVAL);
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[ReminderJob] Parado');
  }
}

module.exports = { start, stop };
