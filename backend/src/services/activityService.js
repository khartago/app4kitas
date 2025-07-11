const { logActivity } = require('../controllers/activityController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Centralized activity logging service
class ActivityService {
  // Log user-related activities
  static async logUserActivity(userId, action, details, institutionId = null) {
    return await logActivity(userId, action, 'User', userId, details, institutionId, null);
  }

  // Log child-related activities
  static async logChildActivity(userId, action, childId, details, institutionId = null, groupId = null) {
    return await logActivity(userId, action, 'Child', childId, details, institutionId, groupId);
  }

  // Log group-related activities
  static async logGroupActivity(userId, action, groupId, details, institutionId = null) {
    return await logActivity(userId, action, 'Group', groupId, details, institutionId, groupId);
  }

  // Log institution-related activities
  static async logInstitutionActivity(userId, action, institutionId, details) {
    return await logActivity(userId, action, 'Institution', institutionId, details, institutionId, null);
  }

  // Log message-related activities
  static async logMessageActivity(userId, action, messageId, details, institutionId = null, groupId = null) {
    return await logActivity(userId, action, 'Message', messageId, details, institutionId, groupId);
  }

  // Log check-in activities
  static async logCheckinActivity(userId, action, childId, details, institutionId = null, groupId = null) {
    return await logActivity(userId, action, 'CheckIn', childId, details, institutionId, groupId);
  }

  // Get context for child activities
  static async getChildContext(childId) {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: { group: true }
    });
    return {
      institutionId: child?.institutionId || null,
      groupId: child?.groupId || null
    };
  }

  // Get context for group activities
  static async getGroupContext(groupId) {
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });
    return {
      institutionId: group?.institutionId || null,
      groupId: group?.id || null
    };
  }

  // Get context for message activities
  static async getMessageContext(childId = null, groupId = null) {
    if (childId) {
      return await this.getChildContext(childId);
    } else if (groupId) {
      return await this.getGroupContext(groupId);
    }
    return { institutionId: null, groupId: null };
  }
}

module.exports = ActivityService; 