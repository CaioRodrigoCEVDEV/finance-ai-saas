const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const profileController = require('./profile.controller');
const {
  validateUpdateProfile,
  validateUpdatePassword
} = require('./profile.validation');

const profileRoutes = Router();

profileRoutes.use('/profile', authenticate);

profileRoutes.get('/profile', profileController.getProfile);
profileRoutes.put('/profile', validateUpdateProfile, profileController.updateProfile);
profileRoutes.put('/profile/password', validateUpdatePassword, profileController.updatePassword);

module.exports = profileRoutes;
