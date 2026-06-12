const prisma = require('../../config/prisma');
const AppError = require('../../utils/app-error');

const VALID_STATUSES = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];

function toFeedbackResponse(feedback) {
  return {
    id: feedback.id,
    name: feedback.name,
    email: feedback.email,
    message: feedback.message,
    pageUrl: feedback.page_url,
    userAgent: feedback.user_agent,
    status: feedback.status,
    createdAt: feedback.created_at.toISOString(),
    updatedAt: feedback.updated_at.toISOString()
  };
}

async function createFeedback(data, tenantId, userId, userName, userEmail, userAgent) {
  const feedback = await prisma.feedback.create({
    data: {
      tenant_id: tenantId,
      user_id: userId,
      name: userName,
      email: userEmail,
      message: data.message,
      page_url: data.pageUrl || null,
      user_agent: userAgent || null,
      status: 'OPEN'
    }
  });

  return toFeedbackResponse(feedback);
}

async function listFeedbacks(tenantId, filters = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where = {
    tenant_id: tenantId
  };

  if (filters.status) {
    where.status = filters.status;
  }

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    }),
    prisma.feedback.count({ where })
  ]);

  return {
    data: feedbacks.map(toFeedbackResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function getFeedback(feedbackId, tenantId) {
  const feedback = await prisma.feedback.findFirst({
    where: {
      id: feedbackId,
      tenant_id: tenantId
    }
  });

  if (!feedback) {
    throw new AppError('Feedback nao encontrado', 404);
  }

  return toFeedbackResponse(feedback);
}

async function updateFeedbackStatus(feedbackId, tenantId, status) {
  const feedback = await prisma.feedback.findFirst({
    where: {
      id: feedbackId,
      tenant_id: tenantId
    }
  });

  if (!feedback) {
    throw new AppError('Feedback nao encontrado', 404);
  }

  const updated = await prisma.feedback.update({
    where: { id: feedback.id },
    data: { status }
  });

  return toFeedbackResponse(updated);
}

module.exports = {
  createFeedback,
  listFeedbacks,
  getFeedback,
  updateFeedbackStatus
};
