const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GDPR Service - Handles soft deletes, scheduled cleanup, and audit logging
 * Ensures full GDPR compliance for data deletion
 */

// Retention periods in days
const RETENTION_PERIODS = {
  USER: 30,           // 30 days after account deletion
  CHILD: 1095,        // 3 years (legal requirement for child data)
  GROUP: 30,          // 30 days after group deletion
  INSTITUTION: 365,   // 1 year after institution deletion
  PERSONAL_TASK: 30,  // 30 days after task deletion
  NOTE: 730,          // 2 years (legal requirement for educational records)
  NOTIFICATION: 365,  // 1 year after notification deletion
  CLOSED_DAY: 365,    // 1 year after closed day deletion
  MESSAGE: 730,       // 2 years (legal requirement for communications)
  ACTIVITY_LOG: 1095, // 3 years (audit requirement)
  FAILED_LOGIN: 365   // 1 year (security requirement)
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
 * Permanently delete expired records
 */
const cleanupExpiredRecords = async () => {
  try {
    const now = new Date();
    let deletedCount = 0;

    // Delete expired users
    const expiredUsers = await prisma.user.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: new Date(now.getTime() - (RETENTION_PERIODS.USER * 24 * 60 * 60 * 1000))
        },
        role: { not: 'SUPER_ADMIN' }
      }
    });

    for (const user of expiredUsers) {
      await prisma.user.delete({ where: { id: user.id } });
      deletedCount++;
    }

    // Delete expired children
    const expiredChildren = await prisma.child.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: new Date(now.getTime() - (RETENTION_PERIODS.CHILD * 24 * 60 * 60 * 1000))
        }
      }
    });

    for (const child of expiredChildren) {
      await prisma.child.delete({ where: { id: child.id } });
      deletedCount++;
    }

    // Delete expired groups
    const expiredGroups = await prisma.group.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: new Date(now.getTime() - (RETENTION_PERIODS.GROUP * 24 * 60 * 60 * 1000))
        }
      }
    });

    for (const group of expiredGroups) {
      await prisma.group.delete({ where: { id: group.id } });
      deletedCount++;
    }

    // Delete expired institutions
    const expiredInstitutions = await prisma.institution.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: new Date(now.getTime() - (RETENTION_PERIODS.INSTITUTION * 24 * 60 * 60 * 1000))
        }
      }
    });

    for (const institution of expiredInstitutions) {
      await prisma.institution.delete({ where: { id: institution.id } });
      deletedCount++;
    }

    // Delete expired personal tasks
    const expiredTasks = await prisma.personalTask.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: new Date(now.getTime() - (RETENTION_PERIODS.PERSONAL_TASK * 24 * 60 * 60 * 1000))
        }
      }
    });

    for (const task of expiredTasks) {
      await prisma.personalTask.delete({ where: { id: task.id } });
      deletedCount++;
    }

    // Delete expired notes
    const expiredNotes = await prisma.note.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: new Date(now.getTime() - (RETENTION_PERIODS.NOTE * 24 * 60 * 60 * 1000))
        }
      }
    });

    for (const note of expiredNotes) {
      await prisma.note.delete({ where: { id: note.id } });
      deletedCount++;
    }

    // Delete expired notifications
    const expiredNotifications = await prisma.notificationLog.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: new Date(now.getTime() - (RETENTION_PERIODS.NOTIFICATION * 24 * 60 * 60 * 1000))
        }
      }
    });

    for (const notification of expiredNotifications) {
      await prisma.notificationLog.delete({ where: { id: notification.id } });
      deletedCount++;
    }

    // Delete expired closed days
    const expiredClosedDays = await prisma.closedDay.findMany({
      where: {
        deletedAt: {
          not: null,
          lt: new Date(now.getTime() - (RETENTION_PERIODS.CLOSED_DAY * 24 * 60 * 60 * 1000))
        }
      }
    });

    for (const closedDay of expiredClosedDays) {
      await prisma.closedDay.delete({ where: { id: closedDay.id } });
      deletedCount++;
    }

    // Log the cleanup
    if (deletedCount > 0) {
      await prisma.activityLog.create({
        data: {
          userId: 'system', // System cleanup
          action: 'GDPR_CLEANUP_COMPLETED',
          entity: 'System',
          entityId: 'cleanup',
          details: `Permanently deleted ${deletedCount} expired records`,
          institutionId: null
        }
      });
    }

    return { success: true, deletedCount };
  } catch (error) {
    console.error('Error during GDPR cleanup:', error);
    throw error;
  }
};

/**
 * Get GDPR audit logs
 */
const getGDPRAuditLogs = async (limit = 100) => {
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
  cleanupExpiredRecords,
  getGDPRAuditLogs,
  RETENTION_PERIODS
}; 