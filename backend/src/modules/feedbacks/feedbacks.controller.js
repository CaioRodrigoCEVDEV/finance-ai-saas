const feedbacksService = require('./feedbacks.service');

async function createFeedback(request, response, next) {
  try {
    const userAgent = request.headers['user-agent'] || null;
    const feedback = await feedbacksService.createFeedback(
      request.body,
      request.tenant.id,
      request.user.id,
      request.user.name,
      request.user.email,
      userAgent
    );
    return response.status(201).json(feedback);
  } catch (error) {
    return next(error);
  }
}

async function listFeedbacks(request, response, next) {
  try {
    const data = await feedbacksService.listFeedbacks(request.tenant.id, request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getFeedback(request, response, next) {
  try {
    const data = await feedbacksService.getFeedback(request.params.id, request.tenant.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateFeedbackStatus(request, response, next) {
  try {
    const data = await feedbacksService.updateFeedbackStatus(
      request.params.id,
      request.tenant.id,
      request.body.status
    );
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createFeedback,
  listFeedbacks,
  getFeedback,
  updateFeedbackStatus
};
