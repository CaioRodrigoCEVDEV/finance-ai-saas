const adminService = require('./admin.service');
const { createAuditLog } = require('../../middlewares/audit-log');

function logAdminAction(request, action, entity, entityId, metadata) {
  createAuditLog(action, entity, entityId, metadata, request);
}

// Dashboard

async function getDashboard(request, response, next) {
  try {
    const data = await adminService.getDashboard();
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

// Tenants

async function listTenants(request, response, next) {
  try {
    const data = await adminService.listTenants(request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getTenantDetails(request, response, next) {
  try {
    const data = await adminService.getTenantDetails(request.params.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateTenant(request, response, next) {
  try {
    const data = await adminService.updateTenant(request.params.id, request.body);
    logAdminAction(request, 'ADMIN_UPDATE_TENANT', 'tenant', request.params.id, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function suspendTenant(request, response, next) {
  try {
    const data = await adminService.suspendTenant(request.params.id);
    logAdminAction(request, 'ADMIN_SUSPEND_TENANT', 'tenant', request.params.id, null);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function reactivateTenant(request, response, next) {
  try {
    const data = await adminService.reactivateTenant(request.params.id);
    logAdminAction(request, 'ADMIN_REACTIVATE_TENANT', 'tenant', request.params.id, null);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

// Users

async function listUsers(request, response, next) {
  try {
    const data = await adminService.listUsers(request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getUserDetails(request, response, next) {
  try {
    const data = await adminService.getUserDetails(request.params.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateUser(request, response, next) {
  try {
    const data = await adminService.updateUser(request.params.id, request.body);
    logAdminAction(request, 'ADMIN_UPDATE_USER', 'user', request.params.id, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function blockUser(request, response, next) {
  try {
    const data = await adminService.blockUser(request.params.id);
    logAdminAction(request, 'ADMIN_BLOCK_USER', 'user', request.params.id, null);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function unblockUser(request, response, next) {
  try {
    const data = await adminService.unblockUser(request.params.id);
    logAdminAction(request, 'ADMIN_UNBLOCK_USER', 'user', request.params.id, null);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function resetUserPassword(request, response, next) {
  try {
    const data = await adminService.resetUserPassword(request.params.id, request.body.password);
    logAdminAction(request, 'ADMIN_RESET_PASSWORD', 'user', request.params.id, null);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

// Plan Limits

async function listPlanLimits(request, response, next) {
  try {
    const data = await adminService.listPlanLimits();
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getPlanLimit(request, response, next) {
  try {
    const data = await adminService.getPlanLimit(request.params.plan);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function updatePlanLimit(request, response, next) {
  try {
    const data = await adminService.updatePlanLimit(request.params.plan, request.body);
    logAdminAction(request, 'ADMIN_UPDATE_PLAN', 'plan_limit', request.params.plan, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

// Feedbacks

async function listAllFeedbacks(request, response, next) {
  try {
    const data = await adminService.listAllFeedbacks(request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getAdminFeedback(request, response, next) {
  try {
    const data = await adminService.getAdminFeedback(request.params.id);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

async function updateAdminFeedback(request, response, next) {
  try {
    const data = await adminService.updateAdminFeedback(request.params.id, request.body);
    logAdminAction(request, 'ADMIN_UPDATE_FEEDBACK', 'feedback', request.params.id, request.body);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

// Audit Logs

async function listAuditLogs(request, response, next) {
  try {
    const data = await adminService.listAuditLogs(request.query);
    return response.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboard,
  listTenants,
  getTenantDetails,
  updateTenant,
  suspendTenant,
  reactivateTenant,
  listUsers,
  getUserDetails,
  updateUser,
  blockUser,
  unblockUser,
  resetUserPassword,
  listPlanLimits,
  getPlanLimit,
  updatePlanLimit,
  listAllFeedbacks,
  getAdminFeedback,
  updateAdminFeedback,
  listAuditLogs
};
