const service = require('./invoices.service');

async function listInvoices(request, response, next) {
  try {
    const data = await service.listInvoices(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getCurrentInvoices(request, response, next) {
  try {
    const data = await service.getCurrentInvoices(request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getInvoice(request, response, next) {
  try {
    const data = await service.getInvoice(request.tenant.id, request.params.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function generateInvoice(request, response, next) {
  try {
    const data = await service.generateInvoice(request.tenant.id, request.body);
    return response.status(201).json(data);
  } catch (error) {
    return next(error);
  }
}

async function recalculateInvoice(request, response, next) {
  try {
    const data = await service.recalculateInvoice(request.tenant.id, request.params.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function payInvoice(request, response, next) {
  try {
    const data = await service.payInvoice(request.tenant.id, request.params.id, request.user.id, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function cancelInvoicePayment(request, response, next) {
  try {
    const data = await service.cancelInvoicePayment(request.tenant.id, request.params.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getInvoiceSummary(request, response, next) {
  try {
    const data = await service.getInvoiceSummary(request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listInvoices,
  getCurrentInvoices,
  getInvoice,
  generateInvoice,
  recalculateInvoice,
  payInvoice,
  cancelInvoicePayment,
  getInvoiceSummary
};
