const profileService = require('./profile.service');

async function getProfile(request, response, next) {
  try {
    const profile = await profileService.getProfile(request.user.id, request.tenant.id);
    return response.json(profile);
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(request, response, next) {
  try {
    const user = await profileService.updateProfile(request.user.id, request.body);
    return response.json({ user, message: 'Dados atualizados com sucesso' });
  } catch (error) {
    return next(error);
  }
}

async function updatePassword(request, response, next) {
  try {
    const { currentPassword, newPassword, confirmPassword } = request.body;
    const result = await profileService.updatePassword(request.user.id, currentPassword, newPassword, confirmPassword);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

async function updateAvatar(request, response, next) {
  try {
    if (!request.file) {
      return response.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    const result = await profileService.updateAvatar(request.user.id, request.file);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

async function removeAvatar(request, response, next) {
  try {
    const result = await profileService.removeAvatar(request.user.id);
    return response.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  updateAvatar,
  removeAvatar
};
