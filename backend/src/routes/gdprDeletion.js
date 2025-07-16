const express = require('express');
const router = express.Router();
const { authMiddleware, requireSuperAdmin } = require('../middlewares/auth');
const {
  getPendingDeletions,
  getGDPRAuditLogs,
  triggerCleanup,
  getRetentionPeriods,
  softDeleteUserEndpoint,
  softDeleteChildEndpoint,
  softDeleteGroupEndpoint,
  softDeleteInstitutionEndpoint,
  exportUserData
} = require('../controllers/gdprDeletionController');

/**
 * GDPR Deletion Routes
 * All routes require authentication and SUPER_ADMIN role
 */

// GET /api/gdpr/pending-deletions - Get pending deletions for dashboard
router.get('/pending-deletions', authMiddleware, getPendingDeletions);

// GET /api/gdpr/audit-logs - Get GDPR audit logs
router.get('/audit-logs', authMiddleware, getGDPRAuditLogs);

// POST /api/gdpr/cleanup - Manually trigger cleanup (Super Admin only)
router.post('/cleanup', authMiddleware, triggerCleanup);

// GET /api/gdpr/retention-periods - Get retention periods info
router.get('/retention-periods', authMiddleware, getRetentionPeriods);

// POST /api/gdpr/soft-delete/user/:userId - Soft delete user
router.post('/soft-delete/user/:userId', authMiddleware, softDeleteUserEndpoint);

// POST /api/gdpr/soft-delete/child/:childId - Soft delete child
router.post('/soft-delete/child/:childId', authMiddleware, softDeleteChildEndpoint);

// POST /api/gdpr/soft-delete/group/:groupId - Soft delete group
router.post('/soft-delete/group/:groupId', authMiddleware, softDeleteGroupEndpoint);

// POST /api/gdpr/soft-delete/institution/:institutionId - Soft delete institution
router.post('/soft-delete/institution/:institutionId', authMiddleware, softDeleteInstitutionEndpoint);

// GET /api/gdpr/export/:userId - Export user data for GDPR compliance
router.get('/export/:userId', requireSuperAdmin, exportUserData);

module.exports = router; 