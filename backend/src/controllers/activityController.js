const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Log an activity
const logActivity = async (userId, action, entity = null, entityId = null, details = null, institutionId = null, groupId = null) => {
  try {
    // Verify user exists before logging activity
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    
    if (!userExists) {
      console.warn(`Cannot log activity: User ${userId} does not exist`);
      return null;
    }
    
    const activityLog = await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        institutionId,
        groupId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    return activityLog;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error, just log it to avoid breaking the main flow
    return null;
  }
};

// Get recent activity logs
const getRecentActivity = async (req, res) => {
  try {
    const { limit = 50, entity, entityId, userId } = req.query;
    const user = req.user;
    
    const where = {};
    
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;
    
    // Role-based filtering
    if (user.role === 'ADMIN') {
      // Admin can only see activities from their institution
      where.OR = [
        { userId: user.id }, // Own activities
        { institutionId: user.institutionId } // Activities from their institution
      ];
    } else if (user.role === 'EDUCATOR') {
      // Educator can only see activities from their groups and their own activities
      const userGroups = await prisma.group.findMany({
        where: {
          educators: {
            some: {
              id: user.id
            }
          }
        },
        select: { id: true }
      });
      
      const groupIds = userGroups.map(g => g.id);
      
      where.OR = [
        { userId: user.id }, // Own activities
        { groupId: { in: groupIds } } // Activities from their groups
      ];
    }
    // SUPER_ADMIN can see all activities (no additional filtering)
    
    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
    });
    
    res.json({ activities });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Aktivitäten' });
  }
};

// Get activity logs for a specific user
const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    
    const activities = await prisma.activityLog.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit),
    });
    
    res.json({ activities });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Benutzeraktivitäten' });
  }
};

module.exports = {
  logActivity,
  getRecentActivity,
  getUserActivity,
}; 