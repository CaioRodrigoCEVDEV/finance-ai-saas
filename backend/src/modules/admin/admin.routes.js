const { Router } = require('express');

const { authenticate } = require('../auth/auth.middleware');
const requireSuperAdmin = require('../../middlewares/require-super-admin');
const controller = require('./admin.controller');
const validation = require('./admin.validation');

const adminRoutes = Router();

adminRoutes.use('/admin', authenticate, requireSuperAdmin);

// Dashboard
adminRoutes.get('/admin/dashboard', controller.getDashboard);

// Tenants
adminRoutes.get('/admin/tenants', validation.validateListQuery, controller.listTenants);
adminRoutes.get('/admin/tenants/:id', validation.validateParams, controller.getTenantDetails);
adminRoutes.patch('/admin/tenants/:id', validation.validateParams, validation.validateUpdateTenant, controller.updateTenant);
adminRoutes.post('/admin/tenants/:id/suspend', validation.validateParams, controller.suspendTenant);
adminRoutes.post('/admin/tenants/:id/reactivate', validation.validateParams, controller.reactivateTenant);

// Users
adminRoutes.get('/admin/users', validation.validateListQuery, controller.listUsers);
adminRoutes.get('/admin/users/:id', validation.validateParams, controller.getUserDetails);
adminRoutes.patch('/admin/users/:id', validation.validateParams, validation.validateUpdateUser, controller.updateUser);
adminRoutes.post('/admin/users/:id/block', validation.validateParams, controller.blockUser);
adminRoutes.post('/admin/users/:id/unblock', validation.validateParams, controller.unblockUser);
adminRoutes.post('/admin/users/:id/reset-password', validation.validateParams, validation.validateResetPassword, controller.resetUserPassword);

// Plan Limits
adminRoutes.get('/admin/plans', controller.listPlanLimits);
adminRoutes.get('/admin/plans/:plan', controller.getPlanLimit);
adminRoutes.patch('/admin/plans/:plan', validation.validateUpdatePlanLimit, controller.updatePlanLimit);

// Feedbacks
adminRoutes.get('/admin/feedbacks', validation.validateListQuery, controller.listAllFeedbacks);
adminRoutes.get('/admin/feedbacks/:id', validation.validateParams, controller.getAdminFeedback);
adminRoutes.patch('/admin/feedbacks/:id', validation.validateParams, validation.validateUpdateFeedback, controller.updateAdminFeedback);

// Audit Logs
adminRoutes.get('/admin/audit-logs', validation.validateListQuery, controller.listAuditLogs);

module.exports = adminRoutes;
