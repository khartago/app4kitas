const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const gdprService = require('../services/gdprService');

/**
 * GDPR Deletion Controller - Handles GDPR-compliant deletion endpoints
 */

// GET /api/gdpr/pending-deletions - Get pending deletions for dashboard
const getPendingDeletions = async (req, res) => {
  try {
    const { role, institutionId } = req.user;
    
    // Only SUPER_ADMIN can access GDPR deletion dashboard
    if (role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Nur Super Admin kann auf die GDPR-Löschungsverwaltung zugreifen'
      });
    }

    const pendingDeletions = await gdprService.getPendingDeletions(role, institutionId);
    
    res.json({
      success: true,
      data: pendingDeletions
    });
  } catch (error) {
    console.error('Error getting pending deletions:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der ausstehenden Löschungen',
      error: error.message
    });
  }
};

// GET /api/gdpr/audit-logs - Get GDPR audit logs
const getGDPRAuditLogs = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Only SUPER_ADMIN can access GDPR audit logs
    if (role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Nur Super Admin kann auf die GDPR-Audit-Logs zugreifen'
      });
    }

    const { limit = 100 } = req.query;
    const logs = await gdprService.getGDPRAuditLogs(parseInt(limit));
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error getting GDPR audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der GDPR-Audit-Logs',
      error: error.message
    });
  }
};

// POST /api/gdpr/cleanup - Manually trigger cleanup (Super Admin only)
const triggerCleanup = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Only SUPER_ADMIN can trigger cleanup
    if (role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Nur Super Admin kann die Bereinigung auslösen'
      });
    }

    const result = await gdprService.cleanupExpiredRecords();
    
    res.json({
      success: true,
      message: `Bereinigung abgeschlossen. ${result.deletedCount} Datensätze permanent gelöscht.`,
      data: result
    });
  } catch (error) {
    console.error('Error triggering cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler bei der Bereinigung',
      error: error.message
    });
  }
};

// GET /api/gdpr/retention-periods - Get retention periods info
const getRetentionPeriods = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Only SUPER_ADMIN can access retention periods
    if (role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Nur Super Admin kann auf die Aufbewahrungsfristen zugreifen'
      });
    }

    res.json({
      success: true,
      data: gdprService.RETENTION_PERIODS
    });
  } catch (error) {
    console.error('Error getting retention periods:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Aufbewahrungsfristen',
      error: error.message
    });
  }
};

// POST /api/gdpr/soft-delete/user/:userId - Soft delete user
const softDeleteUserEndpoint = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const requestingUserId = req.user.id;
    const { role } = req.user;

    // Check permissions
    if (role !== 'SUPER_ADMIN' && requestingUserId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung für Kontolöschung'
      });
    }

    // Check if user exists and is not already deleted
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    if (user.deletedAt) {
      return res.status(400).json({
        success: false,
        message: 'Benutzer ist bereits zur Löschung markiert'
      });
    }

    // Prevent deletion of SUPER_ADMIN accounts
    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'SUPER_ADMIN Konten können nicht gelöscht werden'
      });
    }

    const result = await gdprService.softDeleteUser(userId, requestingUserId, reason);

    res.json({
      success: true,
      message: 'Benutzerkonto zur Löschung markiert',
      data: result
    });
  } catch (error) {
    // If Prisma throws an error for invalid UUID, return 404
    if (error.code === 'P2023' || error.message?.includes('Invalid')) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }
    console.error('Error soft deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler bei der Kontolöschung',
      error: error.message
    });
  }
};

// POST /api/gdpr/soft-delete/child/:childId - Soft delete child
const softDeleteChildEndpoint = async (req, res) => {
  try {
    const { childId } = req.params;
    const { reason } = req.body;
    const requestingUserId = req.user.id;
    const { role } = req.user;

    // Check permissions
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Nur Admin kann Kinder löschen'
      });
    }

    // Check if child exists and is not already deleted
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: { group: true }
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Kind nicht gefunden'
      });
    }

    // Idempotent: If already soft-deleted, return 200
    if (child.deletedAt) {
      return res.status(200).json({
        success: true,
        message: 'Kind ist bereits zur Löschung markiert',
        data: { child }
      });
    }

    // Check institution permissions for non-super admin
    if (role !== 'SUPER_ADMIN' && child.group?.institutionId !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung (Institution)'
      });
    }

    const result = await gdprService.softDeleteChild(childId, requestingUserId, reason);

    res.json({
      success: true,
      message: 'Kind zur Löschung markiert',
      data: result
    });
  } catch (error) {
    console.error('Error soft deleting child:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler bei der Kinderlöschung',
      error: error.message
    });
  }
};

// POST /api/gdpr/soft-delete/group/:groupId - Soft delete group
const softDeleteGroupEndpoint = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { reason } = req.body;
    const requestingUserId = req.user.id;
    const { role } = req.user;

    // Check permissions
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Nur Admin kann Gruppen löschen'
      });
    }

    // Check if group exists and is not already deleted
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { children: true }
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Gruppe nicht gefunden'
      });
    }

    // Idempotent: If already soft-deleted, return 200
    if (group.deletedAt) {
      return res.status(200).json({
        success: true,
        message: 'Gruppe ist bereits zur Löschung markiert',
        data: { group }
      });
    }

    // Check institution permissions for non-super admin
    if (role !== 'SUPER_ADMIN' && group.institutionId !== req.user.institutionId) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung (Institution)'
      });
    }

    const result = await gdprService.softDeleteGroup(groupId, requestingUserId, reason);

    res.json({
      success: true,
      message: 'Gruppe zur Löschung markiert',
      data: result
    });
  } catch (error) {
    // If Prisma throws an error for invalid UUID, return 404
    if (error.code === 'P2023' || error.message?.includes('Invalid')) {
      return res.status(404).json({
        success: false,
        message: 'Gruppe nicht gefunden'
      });
    }
    console.error('Error soft deleting group:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler bei der Gruppenlöschung',
      error: error.message
    });
  }
};

// POST /api/gdpr/soft-delete/institution/:institutionId - Soft delete institution
const softDeleteInstitutionEndpoint = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { reason } = req.body;
    const requestingUserId = req.user.id;
    const { role } = req.user;

    // Check permissions
    if (role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Nur Super Admin kann Institutionen löschen'
      });
    }

    // Check if institution exists and is not already deleted
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId }
    });

    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institution nicht gefunden'
      });
    }

    if (institution.deletedAt) {
      return res.status(400).json({
        success: false,
        message: 'Institution ist bereits zur Löschung markiert'
      });
    }

    const result = await gdprService.softDeleteInstitution(institutionId, requestingUserId, reason);

    res.json({
      success: true,
      message: 'Institution zur Löschung markiert',
      data: result
    });
  } catch (error) {
    console.error('Error soft deleting institution:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler bei der Institutionslöschung',
      error: error.message
    });
  }
};

module.exports = {
  getPendingDeletions,
  getGDPRAuditLogs,
  triggerCleanup,
  getRetentionPeriods,
  softDeleteUserEndpoint,
  softDeleteChildEndpoint,
  softDeleteGroupEndpoint,
  softDeleteInstitutionEndpoint
}; 