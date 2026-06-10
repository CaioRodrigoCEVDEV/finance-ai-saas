const { Router } = require('express');
const multer = require('multer');

const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const { strictLimiter } = require('../../middlewares/rate-limiter');
const importsController = require('./imports.controller');
const { validateConfirmBody } = require('./imports.validation');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});

const importsRoutes = Router();

importsRoutes.post(
  '/imports/preview',
  strictLimiter,
  authenticate,
  requireWrite,
  upload.single('file'),
  importsController.preview
);

importsRoutes.post(
  '/imports/confirm',
  strictLimiter,
  authenticate,
  requireWrite,
  validateConfirmBody,
  importsController.confirm
);

module.exports = importsRoutes;
