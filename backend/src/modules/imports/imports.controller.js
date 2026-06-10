const importsService = require('./imports.service');

async function preview(request, response, next) {
  try {
    const file = request.file;
    const accountId = request.body.accountId || null;
    const creditCardId = request.body.creditCardId || null;

    const result = await importsService.previewFile(
      file,
      accountId,
      creditCardId,
      request.tenant.id
    );

    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

async function confirm(request, response, next) {
  try {
    const result = await importsService.confirmImport(
      request.body,
      request.tenant.id,
      request.user.id
    );

    return response.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  preview,
  confirm
};
