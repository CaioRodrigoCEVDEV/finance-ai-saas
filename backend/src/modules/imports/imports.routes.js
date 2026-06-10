const { Router } = require('express');
const multer = require('multer');

const { authenticate } = require('../auth/auth.middleware');
const importsController = require('./imports.controller');
const { validateConfirmBody } = require('./imports.validation');

const upload = multer({ storage: multer.memoryStorage() });

const importsRoutes = Router();

importsRoutes.post(
  '/imports/preview',
  authenticate,
  upload.single('file'),
  importsController.preview
);

importsRoutes.post(
  '/imports/confirm',
  authenticate,
  validateConfirmBody,
  importsController.confirm
);

module.exports = importsRoutes;
