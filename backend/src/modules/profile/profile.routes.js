const { Router } = require('express');
const multer = require('multer');

const { authenticate } = require('../auth/auth.middleware');
const profileController = require('./profile.controller');
const {
  validateUpdateProfile,
  validateUpdatePassword,
  validateAvatarUpload
} = require('./profile.validation');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: (_request, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Formato de imagem não permitido. Use JPEG, PNG, WebP ou GIF.'), false);
    }
  }
});

const profileRoutes = Router();

profileRoutes.use('/profile', authenticate);

profileRoutes.get('/profile', profileController.getProfile);
profileRoutes.put('/profile', validateUpdateProfile, profileController.updateProfile);
profileRoutes.put('/profile/password', validateUpdatePassword, profileController.updatePassword);
profileRoutes.put('/profile/avatar', upload.single('avatar'), validateAvatarUpload, profileController.updateAvatar);
profileRoutes.delete('/profile/avatar', profileController.removeAvatar);

module.exports = profileRoutes;
