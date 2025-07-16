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

    const { limit = parseInt(process.env.GDPR_DELETION_LIMIT) || 100 } = req.query;
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
    const { retentionMonths = 12 } = req.body; // Accept optional retentionMonths parameter
    
    // Only SUPER_ADMIN can trigger cleanup
    if (role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Nur Super Admin kann die Bereinigung auslösen'
      });
    }

    const result = await gdprService.purgeSoftDeletedEntities(retentionMonths);
    
    res.json({
      success: true,
      message: `Bereinigung abgeschlossen. ${result.totalPurged} Datensätze permanent gelöscht (Retention: ${retentionMonths} Monate).`,
      data: {
        purged: result.purged,
        totalPurged: result.totalPurged,
        retentionMonths: result.retentionMonths
      }
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
    const childInstitutionId = child.group?.institutionId || child.institutionId;
    if (role !== 'SUPER_ADMIN' && childInstitutionId !== req.user.institutionId) {
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

// GET /api/gdpr/export/:userId - Export user data for GDPR compliance
const exportUserData = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;

    console.log('[GDPR Export] Requested userId:', userId);
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: {
        children: {
          include: {
            checkIns: {
              include: {
                actor: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              },
              where: {
                deletedAt: null
              }
            },
            notes: {
              include: {
                educator: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              },
              where: {
                deletedAt: null
              }
            },
            group: {
              select: {
                id: true,
                name: true
              }
            }
          },
          where: {
            deletedAt: null
          }
        },
        messages: {
          where: {
            deletedAt: null
          },
          include: {
            child: {
              select: {
                id: true,
                name: true
              }
            },
            group: {
              select: {
                id: true,
                name: true
              }
            },
            channel: {
              select: {
                id: true,
                name: true
              }
            },
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            replies: {
              where: {
                deletedAt: null
              },
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        notifications: {
          where: {
            deletedAt: null
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        activityLogs: {
          where: {
            deletedAt: null
          }
        },
        personalTasks: {
          where: {
            deletedAt: null
          }
        },
        notes: {
          where: {
            deletedAt: null
          },
          include: {
            child: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    console.log('[GDPR Export] User found:', !!user, user && user.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    // Create audit log entry
    await prisma.activityLog.create({
      data: {
        userId: requestingUserId,
        action: 'EXPORT_PERSONAL_DATA',
        entity: 'User',
        entityId: userId,
        details: `Datenexport für Benutzer ${user.email} durchgeführt`,
        institutionId: user.institutionId
      }
    });

    // Structure the response data
    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      children: user.children.map(child => ({
        id: child.id,
        name: child.name,
        birthdate: child.birthdate,
        photoUrl: child.photoUrl,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
        group: child.group,
        checkIns: child.checkIns.map(checkIn => ({
          id: checkIn.id,
          type: checkIn.type,
          timestamp: checkIn.timestamp,
          method: checkIn.method,
          actor: checkIn.actor
        })),
        notes: child.notes.map(note => ({
          id: note.id,
          content: note.content,
          attachmentUrl: note.attachmentUrl,
          attachmentName: note.attachmentName,
          attachmentType: note.attachmentType,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          educator: note.educator
        }))
      })),
      messages: user.messages.map(message => ({
        id: message.id,
        content: message.content,
        fileUrl: message.fileUrl,
        fileType: message.fileType,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        editedAt: message.editedAt,
        isEdited: message.isEdited,
        child: message.child,
        group: message.group,
        channel: message.channel,
        reactions: message.reactions.map(reaction => ({
          emoji: reaction.emoji,
          user: reaction.user
        })),
        replies: message.replies.map(reply => ({
          id: reply.id,
          content: reply.content,
          createdAt: reply.createdAt,
          sender: reply.sender
        }))
      })),
      notifications: user.notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        body: notification.body,
        priority: notification.priority,
        read: notification.read,
        createdAt: notification.createdAt,
        sender: notification.sender
      })),
      activityLogs: user.activityLogs.map(log => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        details: log.details,
        createdAt: log.createdAt
      })),
      personalTasks: user.personalTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        completed: task.completed,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      })),
      notes: user.notes.map(note => ({
        id: note.id,
        content: note.content,
        attachmentUrl: note.attachmentUrl,
        attachmentName: note.attachmentName,
        attachmentType: note.attachmentType,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        child: note.child
      }))
    };

    // If ?inline=true, return as JSON (for tests)
    if (req.query.inline === 'true') {
      return res.json({
        success: true,
        message: 'Datenexport erfolgreich abgeschlossen',
        data: exportData,
        exportDate: new Date().toISOString()
      });
    }

    // Otherwise, send as downloadable file
    const filename = `gdpr_export_${userId}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(JSON.stringify({
      success: true,
      message: 'Datenexport erfolgreich abgeschlossen',
      data: exportData,
      exportDate: new Date().toISOString()
    }, null, 2));

  } catch (error) {
    // If Prisma throws an error for invalid UUID, return 404
    if (error.code === 'P2023' || error.message?.includes('Invalid')) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }
    console.error('Error exporting user data:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Exportieren der Benutzerdaten',
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
  softDeleteInstitutionEndpoint,
  exportUserData
}; 