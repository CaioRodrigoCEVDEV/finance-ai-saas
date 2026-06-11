const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const financialCalendarController = require('./financialCalendar.controller');
const { validateMonthQuery } = require('./financialCalendar.validation');

const financialCalendarRoutes = Router();

financialCalendarRoutes.use('/financial-calendar', authenticate);

financialCalendarRoutes.get(
  '/financial-calendar/month',
  validateMonthQuery,
  financialCalendarController.getMonthCalendar
);

module.exports = financialCalendarRoutes;
