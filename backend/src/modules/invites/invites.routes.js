const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const { requireWrite } = require('../../middlewares/authorize');
const invitesController = require('./invites.controller');
const {
  validateCreateInvite,
  validateUpdateInviteStatus,
  validateInviteParams,
  validateInviteCodeParams
} = require('./invites.validation');

const invitesRoutes = Router();

invitesRoutes.post('/invites/track/:code', validateInviteCodeParams, invitesController.trackInvite);

invitesRoutes.use('/invites', authenticate);

invitesRoutes.get('/invites', invitesController.listInvites);
invitesRoutes.post('/invites', requireWrite, validateCreateInvite, invitesController.createInvite);
invitesRoutes.patch('/invites/:id/status', requireWrite, validateInviteParams, validateUpdateInviteStatus, invitesController.updateInviteStatus);
invitesRoutes.delete('/invites/:id', requireWrite, validateInviteParams, invitesController.deleteInvite);

module.exports = invitesRoutes;
