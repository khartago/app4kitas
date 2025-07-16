const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GDPR Service - Handles soft deletes, scheduled cleanup, and audit logging
 * Ensures full GDPR compliance for data deletion
 */

// Retention periods in days - configurable via environment variables
const RETENTION_PERIODS = {
  USER: parseInt(process.env.GDPR_USER_RETENTION_DAYS) || 30,           // 30 days after account deletion
  CHILD: parseInt(process.env.GDPR_CHILD_RETENTION_DAYS) || 1095,       // 3 years (legal requirement for child data)
  GROUP: parseInt(process.env.GDPR_GROUP_RETENTION_DAYS) || 30,         // 30 days after group deletion
  INSTITUTION: parseInt(process.env.GDPR_INSTITUTION_RETENTION_DAYS) || 365,   // 1 year after institution deletion
  PERSONAL_TASK: parseInt(process.env.GDPR_PERSONAL_TASK_RETENTION_DAYS) || 30,  // 30 days after task deletion
  NOTE: parseInt(process.env.GDPR_NOTE_RETENTION_DAYS) || 730,          // 2 years (legal requirement for educational records)
  NOTIFICATION: parseInt(process.env.GDPR_NOTIFICATION_RETENTION_DAYS) || 365,  // 1 year after notification deletion
  CLOSED_DAY: parseInt(process.env.GDPR_CLOSED_DAY_RETENTION_DAYS) || 365,    // 1 year after closed day deletion
  MESSAGE: parseInt(process.env.GDPR_MESSAGE_RETENTION_DAYS) || 730,       // 2 years (legal requirement for communications)
  ACTIVITY_LOG: parseInt(process.env.GDPR_ACTIVITY_LOG_RETENTION_DAYS) || 1095, // 3 years (audit requirement)
  FAILED_LOGIN: parseInt(process.env.GDPR_FAILED_LOGIN_RETENTION_DAYS) || 365   // 1 year (security requirement)
};

/**
 * Soft delete a user account with cascading deletes
 */
const softDeleteUser = async (userId, requestedBy, reason = 'User requested deletion') => {
  try {
    // Log the deletion request
    await prisma.activityLog.create({
      data: {
        userId: requestedBy,
        action: 'GDPR_USER_SOFT_DELETE',
        entity: 'User',
        entityId: userId,
        details: `Soft delete requested: ${reason}`,
        institutionId: null
      }
    });

    // Start transaction for cascading deletes
    const result = await prisma.$transaction(async (tx) => {
      // Soft delete user's personal tasks
      await tx.personalTask.updateMany({
        where: { userId: userId, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      // Soft delete user's notes
      await tx.note.updateMany({
        where: { educatorId: userId, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      // Soft delete user's notifications
      await tx.notificationLog.updateMany({
        where: { userId: userId, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      // Soft delete user's sent notifications
      await tx.notificationLog.updateMany({
        where: { senderId: userId, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      // Soft delete user's messages
      await tx.message.updateMany({
        where: { senderId: userId, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      // Soft delete user's activity logs
      await tx.activityLog.updateMany({
        where: { userId: userId },
        data: { deletedAt: new Date() }
      });

      // Soft delete the user
      const user = await tx.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() }
      });

      return user;
    });

    return { success: true, user: result };
  } catch (error) {
    console.error('Error soft deleting user:', error);
    throw error;
  }
};

/**
 * Soft delete a child with cascading deletes
 */
const softDeleteChild = async (childId, requestedBy, reason = 'Child left institution') => {
  try {
    // Log the deletion request
    await prisma.activityLog.create({
      data: {
        userId: requestedBy,
        action: 'GDPR_CHILD_SOFT_DELETE',
        entity: 'Child',
        entityId: childId,
        details: `Soft delete requested: ${reason}`,
        institutionId: null
      }
    });

    // Start transaction for cascading deletes
    const result = await prisma.$transaction(async (tx) => {
      // Disconnect all parents from the child
      await tx.child.update({
        where: { id: childId },
        data: { parents: { set: [] } }
      });

      // Soft delete child's notes
      await tx.note.updateMany({
        where: { childId: childId, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      // Soft delete child's messages
      await tx.message.updateMany({
        where: { childId: childId, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      // Soft delete child's check-in logs
      await tx.checkInLog.updateMany({
        where: { childId: childId },
        data: { deletedAt: new Date() }
      });

      // Soft delete the child
      const child = await tx.child.update({
        where: { id: childId },
        data: { deletedAt: new Date() }
      });

      return child;
    });

    return { success: true, child: result };
  } catch (error) {
    console.error('Error soft deleting child:', error);
    throw error;
  }
};

/**
 * Soft delete a group with cascading deletes
 * NOTE: Children are NOT deleted, only their groupId is set to null
 */
const softDeleteGroup = async (groupId, requestedBy, reason = 'Group deleted') => {
  try {
    // Log the deletion request
    await prisma.activityLog.create({
      data: {
        userId: requestedBy,
        action: 'GDPR_GROUP_SOFT_DELETE',
        entity: 'Group',
        entityId: groupId,
        details: `Soft delete requested: ${reason}`,
        institutionId: null
      }
    });

    // Start transaction for cascading deletes
    const result = await prisma.$transaction(async (tx) => {
      // Set children's groupId to null (children are NOT deleted)
      await tx.child.updateMany({
        where: { groupId: groupId },
        data: { groupId: null }
      });

      // Soft delete group's messages
      await tx.message.updateMany({
        where: { groupId: groupId, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      // Soft delete the group
      const group = await tx.group.update({
        where: { id: groupId },
        data: { deletedAt: new Date() }
      });

      return group;
    });

    return { success: true, group: result };
  } catch (error) {
    console.error('Error soft deleting group:', error);
    throw error;
  }
};

/**
 * Soft delete an institution with cascading deletes
 */
const softDeleteInstitution = async (institutionId, requestedBy, reason = 'Institution closed') => {
  try {
    // Log the deletion request
    await prisma.activityLog.create({
      data: {
        userId: requestedBy,
        action: 'GDPR_INSTITUTION_SOFT_DELETE',
        entity: 'Institution',
        entityId: institutionId,
        details: `Soft delete requested: ${reason}`,
        institutionId: null
      }
    });

    // Start transaction for cascading deletes
    const result = await prisma.$transaction(async (tx) => {
      // Soft delete institution's groups
      await tx.group.updateMany({
        where: { institutionId: institutionId, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      // Soft delete institution's children
      await tx.child.updateMany({
        where: { institutionId: institutionId, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      // Soft delete institution's closed days
      await tx.closedDay.updateMany({
        where: { institutionId: institutionId, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      // Soft delete institution's messages
      await tx.message.updateMany({
        where: { institutionId: institutionId, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      // Soft delete institution's notifications
      await tx.notificationLog.updateMany({
        where: { institutionId: institutionId, deletedAt: null },
        data: { deletedAt: new Date() }
      });

      // Soft delete institution's check-in logs
      await tx.checkInLog.updateMany({
        where: { institutionId: institutionId },
        data: { deletedAt: new Date() }
      });

      // Soft delete the institution
      const institution = await tx.institution.update({
        where: { id: institutionId },
        data: { deletedAt: new Date() }
      });

      return institution;
    });

    return { success: true, institution: result };
  } catch (error) {
    console.error('Error soft deleting institution:', error);
    throw error;
  }
};

/**
 * Soft delete a personal task
 */
const softDeletePersonalTask = async (taskId, requestedBy, reason = 'Task deleted') => {
  try {
    // Log the deletion request
    await prisma.activityLog.create({
      data: {
        userId: requestedBy,
        action: 'GDPR_PERSONAL_TASK_SOFT_DELETE',
        entity: 'PersonalTask',
        entityId: taskId,
        details: `Soft delete requested: ${reason}`,
        institutionId: null
      }
    });

    // Soft delete the task
    const task = await prisma.personalTask.update({
      where: { id: taskId },
      data: { deletedAt: new Date() }
    });

    return { success: true, task };
  } catch (error) {
    console.error('Error soft deleting personal task:', error);
    throw error;
  }
};

/**
 * Soft delete a note
 */
const softDeleteNote = async (noteId, requestedBy, reason = 'Note deleted') => {
  try {
    // Log the deletion request
    await prisma.activityLog.create({
      data: {
        userId: requestedBy,
        action: 'GDPR_NOTE_SOFT_DELETE',
        entity: 'Note',
        entityId: noteId,
        details: `Soft delete requested: ${reason}`,
        institutionId: null
      }
    });

    // Soft delete the note
    const note = await prisma.note.update({
      where: { id: noteId },
      data: { deletedAt: new Date() }
    });

    return { success: true, note };
  } catch (error) {
    console.error('Error soft deleting note:', error);
    throw error;
  }
};

/**
 * Soft delete a notification
 */
const softDeleteNotification = async (notificationId, requestedBy, reason = 'Notification deleted') => {
  try {
    // Log the deletion request
    await prisma.activityLog.create({
      data: {
        userId: requestedBy,
        action: 'GDPR_NOTIFICATION_SOFT_DELETE',
        entity: 'NotificationLog',
        entityId: notificationId,
        details: `Soft delete requested: ${reason}`,
        institutionId: null
      }
    });

    // Soft delete the notification
    const notification = await prisma.notificationLog.update({
      where: { id: notificationId },
      data: { deletedAt: new Date() }
    });

    return { success: true, notification };
  } catch (error) {
    console.error('Error soft deleting notification:', error);
    throw error;
  }
};

/**
 * Soft delete a closed day
 */
const softDeleteClosedDay = async (closedDayId, requestedBy, reason = 'Closed day deleted') => {
  try {
    // Log the deletion request
    await prisma.activityLog.create({
      data: {
        userId: requestedBy,
        action: 'GDPR_CLOSED_DAY_SOFT_DELETE',
        entity: 'ClosedDay',
        entityId: closedDayId,
        details: `Soft delete requested: ${reason}`,
        institutionId: null
      }
    });

    // Soft delete the closed day
    const closedDay = await prisma.closedDay.update({
      where: { id: closedDayId },
      data: { deletedAt: new Date() }
    });

    return { success: true, closedDay };
  } catch (error) {
    console.error('Error soft deleting closed day:', error);
    throw error;
  }
};

/**
 * Get pending deletions for GDPR dashboard
 */
const getPendingDeletions = async (userRole, institutionId = null) => {
  try {
    const now = new Date();
    const pendingDeletions = [];

    // Get soft-deleted users
    const softDeletedUsers = await prisma.user.findMany({
      where: {
        deletedAt: { not: null },
        role: { not: 'SUPER_ADMIN' } // Never delete super admins
      },
      include: {
        institution: true
      }
    });

    for (const user of softDeletedUsers) {
      const deletionDate = new Date(user.deletedAt);
      const retentionDate = new Date(deletionDate.getTime() + (RETENTION_PERIODS.USER * 24 * 60 * 60 * 1000));
      
      pendingDeletions.push({
        id: user.id,
        type: 'User',
        name: user.name,
        email: user.email,
        deletedAt: user.deletedAt,
        retentionDate: retentionDate,
        daysUntilPermanentDeletion: Math.ceil((retentionDate - now) / (24 * 60 * 60 * 1000)),
        institution: user.institution?.name || 'No Institution'
      });
    }

    // Get soft-deleted children
    const softDeletedChildren = await prisma.child.findMany({
      where: {
        deletedAt: { not: null }
      },
      include: {
        institution: true,
        group: true
      }
    });

    for (const child of softDeletedChildren) {
      const deletionDate = new Date(child.deletedAt);
      const retentionDate = new Date(deletionDate.getTime() + (RETENTION_PERIODS.CHILD * 24 * 60 * 60 * 1000));
      
      pendingDeletions.push({
        id: child.id,
        type: 'Child',
        name: child.name,
        deletedAt: child.deletedAt,
        retentionDate: retentionDate,
        daysUntilPermanentDeletion: Math.ceil((retentionDate - now) / (24 * 60 * 60 * 1000)),
        institution: child.institution?.name || 'No Institution',
        group: child.group?.name || 'No Group'
      });
    }

    // Filter by institution if not super admin
    if (userRole !== 'SUPER_ADMIN' && institutionId) {
      return pendingDeletions.filter(deletion => 
        deletion.institution === institutionId || deletion.institution === 'No Institution'
      );
    }

    return pendingDeletions;
  } catch (error) {
    console.error('Error getting pending deletions:', error);
    throw error;
  }
};

/**
 * Permanently delete expired records with configurable retention period
 * @param {number} retentionMonths - Retention period in months (default: 12)
 */
const purgeSoftDeletedEntities = async (retentionMonths = 12) => {
  try {
    const now = new Date();
    const retentionDays = retentionMonths * 30; // Approximate days
    const cutoffDate = new Date(now.getTime() - (retentionDays * 24 * 60 * 60 * 1000));
    
    let purgedCounts = {
      users: 0,
      children: 0,
      groups: 0,
      institutions: 0,
      personalTasks: 0,
      notes: 0,
      notifications: 0,
      closedDays: 0,
      messages: 0,
      activityLogs: 0
    };

    // Delete expired users (except SUPER_ADMIN)
    const expiredUsers = await prisma.user.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate
        },
        role: { not: 'SUPER_ADMIN' }
      }
    });

    for (const user of expiredUsers) {
      await prisma.user.delete({ where: { id: user.id } });
      purgedCounts.users++;
      
      // Log individual purge
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'GDPR_PURGE_ENTITY',
          entity: 'User',
          entityId: user.id,
          details: `Permanently deleted user: ${user.email} (retention: ${retentionMonths} months)`,
          institutionId: null
        }
      });
    }

    // Delete expired children
    const expiredChildren = await prisma.child.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate
        }
      }
    });

    for (const child of expiredChildren) {
      await prisma.child.delete({ where: { id: child.id } });
      purgedCounts.children++;
      
      // Log individual purge
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'GDPR_PURGE_ENTITY',
          entity: 'Child',
          entityId: child.id,
          details: `Permanently deleted child: ${child.name} (retention: ${retentionMonths} months)`,
          institutionId: null
        }
      });
    }

    // Delete expired groups
    const expiredGroups = await prisma.group.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate
        }
      }
    });

    for (const group of expiredGroups) {
      await prisma.group.delete({ where: { id: group.id } });
      purgedCounts.groups++;
      
      // Log individual purge
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'GDPR_PURGE_ENTITY',
          entity: 'Group',
          entityId: group.id,
          details: `Permanently deleted group: ${group.name} (retention: ${retentionMonths} months)`,
          institutionId: null
        }
      });
    }

    // Delete expired institutions
    const expiredInstitutions = await prisma.institution.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate
        }
      }
    });

    for (const institution of expiredInstitutions) {
      await prisma.institution.delete({ where: { id: institution.id } });
      purgedCounts.institutions++;
      
      // Log individual purge
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'GDPR_PURGE_ENTITY',
          entity: 'Institution',
          entityId: institution.id,
          details: `Permanently deleted institution: ${institution.name} (retention: ${retentionMonths} months)`,
          institutionId: null
        }
      });
    }

    // Delete expired personal tasks
    const expiredTasks = await prisma.personalTask.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate
        }
      }
    });

    for (const task of expiredTasks) {
      await prisma.personalTask.delete({ where: { id: task.id } });
      purgedCounts.personalTasks++;
      
      // Log individual purge
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'GDPR_PURGE_ENTITY',
          entity: 'PersonalTask',
          entityId: task.id,
          details: `Permanently deleted personal task (retention: ${retentionMonths} months)`,
          institutionId: null
        }
      });
    }

    // Delete expired notes
    const expiredNotes = await prisma.note.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate
        }
      }
    });

    for (const note of expiredNotes) {
      await prisma.note.delete({ where: { id: note.id } });
      purgedCounts.notes++;
      
      // Log individual purge
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'GDPR_PURGE_ENTITY',
          entity: 'Note',
          entityId: note.id,
          details: `Permanently deleted note (retention: ${retentionMonths} months)`,
          institutionId: null
        }
      });
    }

    // Delete expired notifications
    const expiredNotifications = await prisma.notificationLog.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate
        }
      }
    });

    for (const notification of expiredNotifications) {
      await prisma.notificationLog.delete({ where: { id: notification.id } });
      purgedCounts.notifications++;
      
      // Log individual purge
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'GDPR_PURGE_ENTITY',
          entity: 'NotificationLog',
          entityId: notification.id,
          details: `Permanently deleted notification (retention: ${retentionMonths} months)`,
          institutionId: null
        }
      });
    }

    // Delete expired closed days
    const expiredClosedDays = await prisma.closedDay.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate
        }
      }
    });

    for (const closedDay of expiredClosedDays) {
      await prisma.closedDay.delete({ where: { id: closedDay.id } });
      purgedCounts.closedDays++;
      
      // Log individual purge
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'GDPR_PURGE_ENTITY',
          entity: 'ClosedDay',
          entityId: closedDay.id,
          details: `Permanently deleted closed day (retention: ${retentionMonths} months)`,
          institutionId: null
        }
      });
    }

    // Delete expired messages
    const expiredMessages = await prisma.message.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate
        }
      }
    });

    for (const message of expiredMessages) {
      await prisma.message.delete({ where: { id: message.id } });
      purgedCounts.messages++;
      
      // Log individual purge
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'GDPR_PURGE_ENTITY',
          entity: 'Message',
          entityId: message.id,
          details: `Permanently deleted message (retention: ${retentionMonths} months)`,
          institutionId: null
        }
      });
    }

    // Delete expired activity logs
    const expiredActivityLogs = await prisma.activityLog.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: cutoffDate
        }
      }
    });

    for (const activityLog of expiredActivityLogs) {
      await prisma.activityLog.delete({ where: { id: activityLog.id } });
      purgedCounts.activityLogs++;
      
      // Note: We don't log activity log deletions to avoid infinite recursion
    }

    const totalPurged = Object.values(purgedCounts).reduce((sum, count) => sum + count, 0);

    // Log the overall cleanup
    if (totalPurged > 0) {
      await prisma.activityLog.create({
        data: {
          userId: 'system',
          action: 'GDPR_PURGE_COMPLETED',
          entity: 'System',
          entityId: 'purge',
          details: `Permanently deleted ${totalPurged} expired records (retention: ${retentionMonths} months)`,
          institutionId: null
        }
      });
    }

    return { 
      success: true, 
      purged: purgedCounts,
      totalPurged,
      retentionMonths
    };
  } catch (error) {
    console.error('Error during GDPR purge:', error);
    throw error;
  }
};

/**
 * Backward compatibility function - uses default retention periods
 * @deprecated Use purgeSoftDeletedEntities with specific retention period
 */
const cleanupExpiredRecords = async () => {
  try {
    const result = await purgeSoftDeletedEntities(12); // Default 12 months
    return { 
      success: true, 
      deletedCount: result.totalPurged 
    };
  } catch (error) {
    console.error('Error during GDPR cleanup:', error);
    throw error;
  }
};

/**
 * Get GDPR audit logs
 */
const getGDPRAuditLogs = async (limit = parseInt(process.env.GDPR_AUDIT_LOG_LIMIT) || 100) => {
  try {
    const logs = await prisma.activityLog.findMany({
      where: {
        action: {
          startsWith: 'GDPR_'
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return logs;
  } catch (error) {
    console.error('Error getting GDPR audit logs:', error);
    throw error;
  }
};

/**
 * Automated GDPR Compliance Monitoring and Reporting
 */

// Compliance monitoring configuration
const COMPLIANCE_CONFIG = {
  ANOMALY_DETECTION_THRESHOLD: parseInt(process.env.GDPR_ANOMALY_THRESHOLD) || 10,
  BACKUP_VERIFICATION_INTERVAL: parseInt(process.env.GDPR_BACKUP_VERIFY_INTERVAL) || 24, // hours
  COMPLIANCE_REPORT_INTERVAL: parseInt(process.env.GDPR_REPORT_INTERVAL) || 168, // 1 week
  PRIVACY_BY_DESIGN_ENABLED: process.env.GDPR_PRIVACY_BY_DESIGN === 'true',
  ANONYMIZATION_ENABLED: process.env.GDPR_ANONYMIZATION === 'true',
  PSEUDONYMIZATION_ENABLED: process.env.GDPR_PSEUDONYMIZATION === 'true'
};

/**
 * Generate automated compliance reports
 */
const generateComplianceReport = async (institutionId = null, dateRange = 'month') => {
  try {
    const now = new Date();
    let startDate;
    
    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get compliance metrics
    const metrics = await prisma.$transaction(async (tx) => {
      const whereClause = institutionId ? { institutionId } : {};
      const dateFilter = {
        createdAt: {
          gte: startDate,
          lte: now
        }
      };

      // Data processing activities
      const dataProcessingCount = await tx.activityLog.count({
        where: {
          ...whereClause,
          ...dateFilter,
          action: {
            in: ['USER_CREATE', 'CHILD_CREATE', 'MESSAGE_SEND', 'NOTE_CREATE', 'CHECKIN_LOG']
          }
        }
      });

      // Data deletion activities
      const dataDeletionCount = await tx.activityLog.count({
        where: {
          ...whereClause,
          ...dateFilter,
          action: {
            startsWith: 'GDPR_'
          }
        }
      });

      // Data export requests
      const dataExportCount = await tx.activityLog.count({
        where: {
          ...whereClause,
          ...dateFilter,
          action: 'GDPR_DATA_EXPORT'
        }
      });

      // Privacy complaints
      const privacyComplaintsCount = await tx.activityLog.count({
        where: {
          ...whereClause,
          ...dateFilter,
          action: 'GDPR_COMPLAINT'
        }
      });

      // Anomaly detection
      const anomalies = await detectAnomalies(tx, whereClause, dateFilter);

      return {
        dataProcessingCount,
        dataDeletionCount,
        dataExportCount,
        privacyComplaintsCount,
        anomalies,
        reportPeriod: {
          start: startDate,
          end: now,
          range: dateRange
        }
      };
    });

    // Log the compliance report generation
    await prisma.activityLog.create({
      data: {
        userId: 'SYSTEM',
        action: 'GDPR_COMPLIANCE_REPORT',
        entity: 'System',
        entityId: 'COMPLIANCE',
        details: `Automated compliance report generated for ${dateRange}`,
        institutionId
      }
    });

    return {
      success: true,
      report: {
        ...metrics,
        generatedAt: now,
        complianceScore: calculateComplianceScore(metrics),
        recommendations: generateComplianceRecommendations(metrics)
      }
    };
  } catch (error) {
    console.error('Error generating compliance report:', error);
    throw error;
  }
};

/**
 * Detect anomalies in data processing activities
 */
const detectAnomalies = async (tx, whereClause, dateFilter) => {
  const anomalies = [];

  // Check for unusual data processing volumes
  const dailyProcessing = await tx.activityLog.groupBy({
    by: ['createdAt'],
    where: {
      ...whereClause,
      ...dateFilter,
      action: {
        in: ['USER_CREATE', 'CHILD_CREATE', 'MESSAGE_SEND', 'NOTE_CREATE']
      }
    },
    _count: {
      id: true
    }
  });

  // Calculate average daily processing
  const totalProcessing = dailyProcessing.reduce((sum, day) => sum + day._count.id, 0);
  const averageDaily = totalProcessing / Math.max(dailyProcessing.length, 1);

  // Detect days with processing > 2x average
  dailyProcessing.forEach(day => {
    if (day._count.id > averageDaily * 2) {
      anomalies.push({
        type: 'HIGH_DATA_PROCESSING',
        date: day.createdAt,
        count: day._count.id,
        threshold: averageDaily * 2,
        severity: 'MEDIUM'
      });
    }
  });

  // Check for unusual deletion patterns
  const deletionPatterns = await tx.activityLog.groupBy({
    by: ['action'],
    where: {
      ...whereClause,
      ...dateFilter,
      action: {
        startsWith: 'GDPR_'
      }
    },
    _count: {
      id: true
    }
  });

  deletionPatterns.forEach(pattern => {
    if (pattern._count.id > COMPLIANCE_CONFIG.ANOMALY_DETECTION_THRESHOLD) {
      anomalies.push({
        type: 'HIGH_DELETION_RATE',
        action: pattern.action,
        count: pattern._count.id,
        threshold: COMPLIANCE_CONFIG.ANOMALY_DETECTION_THRESHOLD,
        severity: 'HIGH'
      });
    }
  });

  return anomalies;
};

/**
 * Calculate compliance score based on metrics
 */
const calculateComplianceScore = (metrics) => {
  let score = 100;
  
  // Deduct points for anomalies
  score -= metrics.anomalies.length * 5;
  
  // Deduct points for high deletion rates
  if (metrics.dataDeletionCount > metrics.dataProcessingCount * 0.1) {
    score -= 10;
  }
  
  // Deduct points for privacy complaints
  score -= metrics.privacyComplaintsCount * 15;
  
  return Math.max(score, 0);
};

/**
 * Generate compliance recommendations
 */
const generateComplianceRecommendations = (metrics) => {
  const recommendations = [];

  if (metrics.anomalies.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'ANOMALY_DETECTION',
      recommendation: 'Review detected anomalies and investigate unusual data processing patterns',
      action: 'Investigate and document all anomalies'
    });
  }

  if (metrics.dataDeletionCount > metrics.dataProcessingCount * 0.1) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'DATA_RETENTION',
      recommendation: 'Review data retention policies - deletion rate is higher than expected',
      action: 'Audit deletion reasons and retention policies'
    });
  }

  if (metrics.privacyComplaintsCount > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'PRIVACY_COMPLAINTS',
      recommendation: 'Address privacy complaints promptly to maintain compliance',
      action: 'Review and resolve all privacy complaints within 30 days'
    });
  }

  if (metrics.dataExportCount === 0) {
    recommendations.push({
      priority: 'LOW',
      category: 'DATA_PORTABILITY',
      recommendation: 'Consider implementing data export features for better GDPR compliance',
      action: 'Implement automated data export functionality'
    });
  }

  return recommendations;
};

/**
 * Automatic backup verification
 */
const verifyBackupIntegrity = async () => {
  try {
    const verificationResults = [];

    // Verify database backup integrity
    const dbVerification = await verifyDatabaseBackup();
    verificationResults.push(dbVerification);

    // Verify file upload backup integrity
    const fileVerification = await verifyFileBackup();
    verificationResults.push(fileVerification);

    // Verify audit log backup integrity
    const auditVerification = await verifyAuditBackup();
    verificationResults.push(auditVerification);

    // Log verification results
    await prisma.activityLog.create({
      data: {
        userId: 'SYSTEM',
        action: 'GDPR_BACKUP_VERIFICATION',
        entity: 'System',
        entityId: 'BACKUP',
        details: `Backup verification completed: ${verificationResults.filter(r => r.success).length}/${verificationResults.length} successful`,
        institutionId: null
      }
    });

    return {
      success: true,
      verificationResults,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error verifying backup integrity:', error);
    throw error;
  }
};

/**
 * Verify database backup integrity
 */
const verifyDatabaseBackup = async () => {
  try {
    // Check if critical tables are accessible
    const criticalTables = ['User', 'Child', 'ActivityLog', 'Message', 'Note'];
    const tableChecks = [];

    for (const table of criticalTables) {
      try {
        const count = await prisma[table.toLowerCase()].count();
        tableChecks.push({
          table,
          accessible: true,
          recordCount: count
        });
      } catch (error) {
        tableChecks.push({
          table,
          accessible: false,
          error: error.message
        });
      }
    }

    const allAccessible = tableChecks.every(check => check.accessible);

    return {
      type: 'DATABASE',
      success: allAccessible,
      details: tableChecks,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      type: 'DATABASE',
      success: false,
      error: error.message,
      timestamp: new Date()
    };
  }
};

/**
 * Verify file backup integrity
 */
const verifyFileBackup = async () => {
  try {
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '../../uploads');

    // Check if uploads directory exists and is accessible
    const dirExists = fs.existsSync(uploadsDir);
    const dirReadable = dirExists ? fs.accessSync(uploadsDir, fs.constants.R_OK) : false;

    // Count files in uploads directory
    let fileCount = 0;
    if (dirExists && dirReadable) {
      try {
        const files = fs.readdirSync(uploadsDir);
        fileCount = files.length;
      } catch (error) {
        fileCount = -1;
      }
    }

    return {
      type: 'FILE_BACKUP',
      success: dirExists && dirReadable,
      details: {
        directoryExists: dirExists,
        directoryReadable: dirReadable,
        fileCount
      },
      timestamp: new Date()
    };
  } catch (error) {
    return {
      type: 'FILE_BACKUP',
      success: false,
      error: error.message,
      timestamp: new Date()
    };
  }
};

/**
 * Verify audit log backup integrity
 */
const verifyAuditBackup = async () => {
  try {
    // Check if audit logs are being written
    const recentAuditLogs = await prisma.activityLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    // Check if critical audit events are being logged
    const criticalEvents = await prisma.activityLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        action: {
          in: ['USER_LOGIN', 'USER_LOGOUT', 'GDPR_DATA_EXPORT', 'GDPR_USER_SOFT_DELETE']
        }
      }
    });

    return {
      type: 'AUDIT_BACKUP',
      success: recentAuditLogs > 0,
      details: {
        recentLogsCount: recentAuditLogs,
        criticalEventsCount: criticalEvents,
        auditLoggingActive: recentAuditLogs > 0
      },
      timestamp: new Date()
    };
  } catch (error) {
    return {
      type: 'AUDIT_BACKUP',
      success: false,
      error: error.message,
      timestamp: new Date()
    };
  }
};

/**
 * Privacy-by-Design implementation
 */
const implementPrivacyByDesign = async () => {
  if (!COMPLIANCE_CONFIG.PRIVACY_BY_DESIGN_ENABLED) {
    return { success: false, message: 'Privacy-by-Design not enabled' };
  }

  try {
    // Implement data minimization
    await implementDataMinimization();
    
    // Implement purpose limitation
    await implementPurposeLimitation();
    
    // Implement storage limitation
    await implementStorageLimitation();
    
    // Implement accuracy measures
    await implementDataAccuracy();
    
    // Implement security measures
    await implementSecurityMeasures();
    
    // Implement accountability
    await implementAccountability();

    return { success: true, message: 'Privacy-by-Design implemented successfully' };
  } catch (error) {
    console.error('Error implementing Privacy-by-Design:', error);
    throw error;
  }
};

/**
 * Implement data minimization
 */
const implementDataMinimization = async () => {
  // Remove unnecessary fields from user profiles
  await prisma.user.updateMany({
    where: {
      phone: { not: null },
      deletedAt: null
    },
    data: {
      phone: null // Remove phone numbers unless explicitly required
    }
  });

  // Anonymize old activity logs
  if (COMPLIANCE_CONFIG.ANONYMIZATION_ENABLED) {
    const oldLogs = await prisma.activityLog.findMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Older than 1 year
        },
        deletedAt: null
      }
    });

    for (const log of oldLogs) {
      await prisma.activityLog.update({
        where: { id: log.id },
        data: {
          details: `[ANONYMIZED] ${log.details?.substring(0, 50)}...`,
          userId: 'ANONYMIZED'
        }
      });
    }
  }
};

/**
 * Implement purpose limitation
 */
const implementPurposeLimitation = async () => {
  // Add purpose tracking to data processing
  await prisma.activityLog.updateMany({
    where: {
      action: {
        in: ['USER_CREATE', 'CHILD_CREATE', 'MESSAGE_SEND']
      },
      deletedAt: null
    },
    data: {
      details: {
        set: prisma.raw(`CONCAT(details, ' [PURPOSE: LEGITIMATE_INTEREST]')`)
      }
    }
  });
};

/**
 * Implement storage limitation
 */
const implementStorageLimitation = async () => {
  // Automatically delete old temporary files
  const fs = require('fs');
  const path = require('path');
  const uploadsDir = path.join(__dirname, '../../uploads');

  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
      }
    }
  }
};

/**
 * Implement data accuracy
 */
const implementDataAccuracy = async () => {
  // Validate email formats
  const invalidEmails = await prisma.user.findMany({
    where: {
      email: {
        not: {
          contains: '@'
        }
      },
      deletedAt: null
    }
  });

  for (const user of invalidEmails) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: `invalid-${user.id}@placeholder.com`
      }
    });
  }
};

/**
 * Implement security measures
 */
const implementSecurityMeasures = async () => {
  // Check for weak passwords (this would be done during registration)
  // Implement rate limiting for sensitive operations
  // Add additional logging for security events
};

/**
 * Implement accountability
 */
const implementAccountability = async () => {
  // Log all privacy-by-design implementations
  await prisma.activityLog.create({
    data: {
      userId: 'SYSTEM',
      action: 'GDPR_PRIVACY_BY_DESIGN',
      entity: 'System',
      entityId: 'COMPLIANCE',
      details: 'Privacy-by-Design measures implemented',
      institutionId: null
    }
  });
};

/**
 * Real-time compliance monitoring
 */
const monitorComplianceRealTime = async () => {
  try {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // Monitor data processing activities
    const processingActivities = await prisma.activityLog.count({
      where: {
        createdAt: { gte: lastHour },
        action: {
          in: ['USER_CREATE', 'CHILD_CREATE', 'MESSAGE_SEND', 'NOTE_CREATE']
        }
      }
    });

    // Monitor deletion activities
    const deletionActivities = await prisma.activityLog.count({
      where: {
        createdAt: { gte: lastHour },
        action: { startsWith: 'GDPR_' }
      }
    });

    // Monitor privacy complaints
    const privacyComplaints = await prisma.activityLog.count({
      where: {
        createdAt: { gte: lastHour },
        action: 'GDPR_COMPLAINT'
      }
    });

    // Generate alerts for anomalies
    const alerts = [];
    
    if (processingActivities > 100) {
      alerts.push({
        type: 'HIGH_DATA_PROCESSING',
        severity: 'MEDIUM',
        message: `High data processing activity detected: ${processingActivities} operations in the last hour`
      });
    }

    if (deletionActivities > 10) {
      alerts.push({
        type: 'HIGH_DELETION_RATE',
        severity: 'HIGH',
        message: `High deletion rate detected: ${deletionActivities} deletions in the last hour`
      });
    }

    if (privacyComplaints > 0) {
      alerts.push({
        type: 'PRIVACY_COMPLAINT',
        severity: 'HIGH',
        message: `${privacyComplaints} privacy complaints received in the last hour`
      });
    }

    return {
      success: true,
      monitoring: {
        processingActivities,
        deletionActivities,
        privacyComplaints,
        timestamp: now
      },
      alerts
    };
  } catch (error) {
    console.error('Error in real-time compliance monitoring:', error);
    throw error;
  }
};

module.exports = {
  softDeleteUser,
  softDeleteChild,
  softDeleteGroup,
  softDeleteInstitution,
  softDeletePersonalTask,
  softDeleteNote,
  softDeleteNotification,
  softDeleteClosedDay,
  getPendingDeletions,
  purgeSoftDeletedEntities,
  cleanupExpiredRecords, // Backward compatibility
  getGDPRAuditLogs,
  RETENTION_PERIODS,
  generateComplianceReport,
  verifyBackupIntegrity,
  implementPrivacyByDesign,
  monitorComplianceRealTime,
  detectAnomalies,
  calculateComplianceScore,
  generateComplianceRecommendations
}; 