const settingsService = require('./settings.service');

async function getSettings(request, response, next) {
  try {
    const settings = await settingsService.getOrCreateSettings(request.tenant.id);
    return response.json(settings);
  } catch (error) {
    return next(error);
  }
}

async function updateSettings(request, response, next) {
  try {
    const settings = await settingsService.updateSettings(request.tenant.id, request.body);
    return response.json({ message: 'Configuracoes salvas com sucesso', ...settings });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSettings,
  updateSettings
};
