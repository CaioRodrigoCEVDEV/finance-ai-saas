const invitesService = require('./invites.service');

async function listInvites(request, response, next) {
  try {
    const data = await invitesService.listInvites(
      request.tenant?.id,
      request.user.id
    );
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function createInvite(request, response, next) {
  try {
    const data = await invitesService.createInvite(
      request.body,
      request.tenant?.id,
      request.user.id
    );
    return response.status(201).json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateInviteStatus(request, response, next) {
  try {
    const data = await invitesService.updateInviteStatus(
      request.params.id,
      request.body.status,
      request.tenant?.id,
      request.user.id
    );
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function deleteInvite(request, response, next) {
  try {
    const data = await invitesService.deleteInvite(
      request.params.id,
      request.tenant?.id,
      request.user.id
    );
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function trackInvite(request, response, next) {
  try {
    const data = await invitesService.trackInvite(request.params.code);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listInvites,
  createInvite,
  updateInviteStatus,
  deleteInvite,
  trackInvite
};
