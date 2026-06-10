const reportsService = require('./reports.service');

async function getFinancialSummary(request, response, next) {
  try {
    const data = await reportsService.getFinancialSummary(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getReportByCategory(request, response, next) {
  try {
    const data = await reportsService.getReportByCategory(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getReportByAccount(request, response, next) {
  try {
    const data = await reportsService.getReportByAccount(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getReportByCreditCard(request, response, next) {
  try {
    const data = await reportsService.getReportByCreditCard(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getMonthlyEvolution(request, response, next) {
  try {
    const data = await reportsService.getMonthlyEvolution(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getTopExpenses(request, response, next) {
  try {
    const limit = parseInt(request.query.limit, 10) || 10;
    const data = await reportsService.getTopExpenses(request.tenant.id, request.query, limit);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function exportCsv(request, response, next) {
  try {
    const transactions = await reportsService.getTransactionsForExport(request.tenant.id, request.query);
    const exporter = require('./reports.exporter');
    const csv = exporter.toCsv(transactions);

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', 'attachment; filename="transacoes.csv"');
    return response.send(csv);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getFinancialSummary,
  getReportByCategory,
  getReportByAccount,
  getReportByCreditCard,
  getMonthlyEvolution,
  getTopExpenses,
  exportCsv
};
