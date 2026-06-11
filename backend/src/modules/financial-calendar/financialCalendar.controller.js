const financialCalendarService = require('./financialCalendar.service');

async function getMonthCalendar(request, response, next) {
  try {
    const { year, month } = request.query;

    const data = await financialCalendarService.buildFinancialCalendar({
      tenantId: request.tenant.id,
      year,
      month
    });

    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMonthCalendar
};
