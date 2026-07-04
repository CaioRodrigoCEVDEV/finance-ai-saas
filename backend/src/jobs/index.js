const financialTaskReminders = require('./financial-task-reminders');
const financialTaskPushReminder = require('./financial-task-push-reminder');

function startAll() {
  financialTaskReminders.start();
  financialTaskPushReminder.start();
}

function stopAll() {
  financialTaskReminders.stop();
  financialTaskPushReminder.stop();
}

module.exports = { startAll, stopAll };
