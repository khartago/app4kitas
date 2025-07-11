const prisma = require('../models/prismaClient');

// POST /notifications/token
async function registerToken(req, res) {
  const { token } = req.body;
  const userId = req.user.id;
  if (!token) return res.status(400).json({ success: false, message: 'Token erforderlich' });
  try {
    // Check if token already exists
    const existing = await prisma.deviceToken.findUnique({ where: { token } });
    if (existing) {
      if (existing.userId !== userId) {
        // Reassign token to this user
        await prisma.deviceToken.update({ where: { token }, data: { userId } });
      }
      // else: token already assigned to this user, do nothing
    } else {
      // Create new token for user
      await prisma.deviceToken.create({ data: { userId, token } });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim Speichern des Tokens' });
  }
}

// POST /notifications/send
async function sendNotification(req, res) {
  const { recipientType, recipientId, title, body, priority = 'normal' } = req.body;
  
  if (!recipientType || (!recipientId && recipientType !== 'global') || !title || !body) {
    return res.status(400).json({ 
      success: false, 
      message: 'recipientType, recipientId (außer bei global), title und body erforderlich' 
    });
  }

  try {
    let userIds = [];
    const currentUser = req.user;

    // Validate permissions based on user role
    if (currentUser.role === 'ADMIN') {
      const institutionId = currentUser.institutionId;
      if (!institutionId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Keine Institution zugeordnet' 
        });
      }

      switch (recipientType) {
        case 'single_child':
          // Get the child and their parents
          const child = await prisma.child.findFirst({
            where: { 
              id: recipientId,
              group: {
                institutionId
              }
            },
            include: {
              parents: true
            }
          });
          if (!child) {
            return res.status(403).json({ 
              success: false, 
              message: 'Kind nicht gefunden oder keine Berechtigung' 
            });
          }
          userIds = child.parents.map(parent => parent.id);
          break;

        case 'single_parent':
          const parent = await prisma.user.findFirst({
            where: { 
              id: recipientId, 
              role: 'PARENT',
              institutionId 
            }
          });
          if (!parent) {
            return res.status(403).json({ 
              success: false, 
              message: 'Elternteil nicht gefunden oder keine Berechtigung' 
            });
          }
          userIds = [parent.id];
          break;

        case 'single_educator':
          const educator = await prisma.user.findFirst({
            where: { 
              id: recipientId, 
              role: 'EDUCATOR',
              institutionId 
            }
          });
          if (!educator) {
            return res.status(403).json({ 
              success: false, 
              message: 'Erzieher nicht gefunden oder keine Berechtigung' 
            });
          }
          userIds = [educator.id];
          break;

        case 'whole_group':
          // Get all parents and educators in the group
          const group = await prisma.group.findFirst({
            where: { 
              id: recipientId, 
              institutionId 
            },
            include: {
              children: {
                include: {
                  parents: true
                }
              },
              educators: true
            }
          });
          
          if (!group) {
            return res.status(403).json({ 
              success: false, 
              message: 'Gruppe nicht gefunden oder keine Berechtigung' 
            });
          }

          // Collect all unique user IDs from parents and educators
          const groupUserIds = new Set();
          group.children.forEach(child => {
            child.parents.forEach(parent => {
              groupUserIds.add(parent.id);
            });
          });
          group.educators.forEach(educator => {
            groupUserIds.add(educator.id);
          });
          
          userIds = Array.from(groupUserIds);
          break;

        case 'all_educators':
          const allEducators = await prisma.user.findMany({
            where: { 
              role: 'EDUCATOR',
              institutionId 
            },
            select: { id: true }
          });
          userIds = allEducators.map(e => e.id);
          break;

        case 'all_children':
          // Get all children and their parents
          const allChildren = await prisma.child.findMany({
            where: {
              group: {
                institutionId
              }
            },
            include: {
              parents: true
            }
          });
          const allParentIds = new Set();
          allChildren.forEach(child => {
            child.parents.forEach(parent => {
              allParentIds.add(parent.id);
            });
          });
          userIds = Array.from(allParentIds);
          break;

        case 'all_parents':
          const allParents = await prisma.user.findMany({
            where: { 
              role: 'PARENT',
              institutionId 
            },
            select: { id: true }
          });
          userIds = allParents.map(p => p.id);
          break;

        case 'global':
          // All users in the institution
          const allUsers = await prisma.user.findMany({
            where: { institutionId },
            select: { id: true }
          });
          userIds = allUsers.map(u => u.id);
          break;

        default:
          return res.status(400).json({ 
            success: false, 
            message: 'Ungültiger Empfängertyp' 
          });
      }
    } else if (currentUser.role === 'SUPER_ADMIN') {
      // Super admin can send to anyone
      switch (recipientType) {
        case 'single_parent':
        case 'single_educator':
          const user = await prisma.user.findUnique({
            where: { id: recipientId }
          });
          if (!user) {
            return res.status(404).json({ 
              success: false, 
              message: 'Benutzer nicht gefunden' 
            });
          }
          userIds = [user.id];
          break;

        case 'whole_group':
          const group = await prisma.group.findUnique({
            where: { id: recipientId },
            include: {
              children: {
                include: {
                  parents: true
                }
              },
              educators: true
            }
          });
          
          if (!group) {
            return res.status(404).json({ 
              success: false, 
              message: 'Gruppe nicht gefunden' 
            });
          }

          const groupUserIds = new Set();
          group.children.forEach(child => {
            child.parents.forEach(parent => {
              groupUserIds.add(parent.id);
            });
          });
          group.educators.forEach(educator => {
            groupUserIds.add(educator.id);
          });
          
          userIds = Array.from(groupUserIds);
          break;

        case 'all_educators':
          const allEducators = await prisma.user.findMany({
            where: { role: 'EDUCATOR' },
            select: { id: true }
          });
          userIds = allEducators.map(e => e.id);
          break;

        case 'all_parents':
          const allParents = await prisma.user.findMany({
            where: { role: 'PARENT' },
            select: { id: true }
          });
          userIds = allParents.map(p => p.id);
          break;

        case 'global':
          // All users in the system
          const allUsers = await prisma.user.findMany({ select: { id: true } });
          userIds = allUsers.map(u => u.id);
          break;

        default:
          return res.status(400).json({ 
            success: false, 
            message: 'Ungültiger Empfängertyp' 
          });
      }
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Keine Berechtigung zum Senden von Benachrichtigungen' 
      });
    }

    if (userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Keine Empfänger gefunden' 
      });
      }

    // Create notifications for all recipients
    const notifications = await Promise.all(
      userIds.map(userId =>
        prisma.notificationLog.create({
          data: { 
            userId, 
            senderId: currentUser.id,
            title, 
            body,
            priority 
          }
        })
      )
    );

    // TODO: Trigger FCM push notifications here
    // await sendPushNotifications(userIds, title, body);

    res.status(201).json({ 
      success: true, 
      notifications,
      recipientCount: userIds.length,
      message: `${notifications.length} Benachrichtigung(en) gesendet`
    });

  } catch (err) {
    console.error('Fehler beim Senden der Benachrichtigung:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Senden der Benachrichtigung' 
    });
  }
}

// GET /notifications/recipients
async function getRecipients(req, res) {
  try {
    const currentUser = req.user;
    let recipients = [];

    if (currentUser.role === 'ADMIN') {
      const institutionId = currentUser.institutionId;
      
      // Get all parents
      const parents = await prisma.user.findMany({
        where: { 
          role: 'PARENT',
          institutionId 
        },
        select: { 
          id: true, 
          name: true, 
          email: true 
        }
      });

      // Get all educators
      const educators = await prisma.user.findMany({
        where: { 
          role: 'EDUCATOR',
          institutionId 
        },
        select: { 
          id: true, 
          name: true, 
          email: true 
        }
      });

      // Get all children
      const children = await prisma.child.findMany({
        where: {
          group: {
            institutionId
          }
        },
        select: { 
          id: true, 
          name: true 
        }
      });

      // Get all groups
      const groups = await prisma.group.findMany({
        where: { institutionId },
        select: { 
          id: true, 
          name: true 
        }
      });

      recipients = {
        parents,
        educators,
        children,
        groups
      };

    } else if (currentUser.role === 'SUPER_ADMIN') {
      // Super admin can see all recipients
      const parents = await prisma.user.findMany({
        where: { role: 'PARENT' },
        select: { 
          id: true, 
          name: true, 
          email: true 
        }
      });

      const educators = await prisma.user.findMany({
        where: { role: 'EDUCATOR' },
        select: { 
          id: true, 
          name: true, 
          email: true 
        }
      });

      const children = await prisma.child.findMany({
        select: { 
          id: true, 
          name: true 
        }
      });

      const groups = await prisma.group.findMany({
        select: { 
          id: true, 
          name: true 
        }
      });

      recipients = {
        parents,
        educators,
        children,
        groups
      };
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Keine Berechtigung' 
      });
    }

    res.json({ success: true, recipients });

  } catch (err) {
    console.error('Error getting recipients:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Laden der Empfänger' 
    });
  }
}

// GET /notifications/:userId
async function getNotifications(req, res) {
  const { userId } = req.params;
  const { page = 1, limit = 20, filter = 'all' } = req.query;
  
  try {
    // Only allow user to see their own notifications or if admin/super_admin
  if (req.user.id !== userId && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
  }

    // Only allow admins to view notifications for users in their own institution
    if (req.user.role === 'ADMIN') {
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser || targetUser.institutionId !== req.user.institutionId) {
        return res.status(403).json({ success: false, message: 'Keine Berechtigung für diese Institution' });
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let whereClause = { userId };
    if (filter === 'unread') {
      whereClause.read = false;
    } else if (filter === 'read') {
      whereClause.read = true;
    }

    const [notifications, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where: whereClause,
      orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.notificationLog.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    console.error('Error getting notifications:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Laden der Benachrichtigungen' 
    });
  }
}

// GET /notifications/stats/:userId
async function getNotificationStats(req, res) {
  const { userId } = req.params;
  
  try {
    // Only allow user to see their own stats or if admin/super_admin
    if (req.user.id !== userId && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
    }

    // Only allow admins to view stats for users in their own institution
    if (req.user.role === 'ADMIN') {
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser || targetUser.institutionId !== req.user.institutionId) {
        return res.status(403).json({ success: false, message: 'Keine Berechtigung für diese Institution' });
      }
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, unread, sentToday, sentThisWeek, sentThisMonth] = await Promise.all([
      prisma.notificationLog.count({ where: { userId } }),
      prisma.notificationLog.count({ where: { userId, read: false } }),
      prisma.notificationLog.count({ 
        where: { 
          userId,
          createdAt: { gte: today }
        }
      }),
      prisma.notificationLog.count({ 
        where: { 
          userId,
          createdAt: { gte: weekAgo }
        }
      }),
      prisma.notificationLog.count({ 
        where: { 
          userId,
          createdAt: { gte: monthAgo }
        }
      })
    ]);

    res.json({
      success: true,
      stats: {
        total,
        unread,
        sentToday,
        sentThisWeek,
        sentThisMonth
      }
    });

  } catch (err) {
    console.error('Error getting notification stats:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Laden der Statistiken' 
    });
  }
}

// GET /notifications/admin
async function getAdminNotifications(req, res) {
  const { page = 1, limit = 20, filter = 'all' } = req.query;
  const currentUser = req.user;
  
  try {
    // Only allow admins and super admins
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get all notifications sent by this user
    const allNotifications = await prisma.notificationLog.findMany({
      where: { 
        senderId: currentUser.id 
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group notifications by title, body, and creation time (within 1 second)
    const groupedNotifications = [];
    const groups = new Map();

    allNotifications.forEach(notification => {
      // Create a key based on title, body, and creation time (rounded to nearest second)
      const createdAt = new Date(notification.createdAt);
      const timeKey = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate(), 
                              createdAt.getHours(), createdAt.getMinutes(), createdAt.getSeconds());
      
      const key = `${notification.title}|${notification.body}|${timeKey.getTime()}`;
      
      if (!groups.has(key)) {
        groups.set(key, {
          id: notification.id,
          title: notification.title,
          body: notification.body,
          priority: notification.priority,
          createdAt: notification.createdAt,
          recipients: [],
          totalRecipients: 0,
          readCount: 0,
          unreadCount: 0
        });
      }
      
      const group = groups.get(key);
      group.recipients.push({
        id: notification.user.id,
        name: notification.user.name,
        role: notification.user.role,
        read: notification.read
      });
      group.totalRecipients++;
      
      if (notification.read) {
        group.readCount++;
      } else {
        group.unreadCount++;
      }
    });

    // Convert to array and sort by creation time
    const sortedGroups = Array.from(groups.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply pagination
    const total = sortedGroups.length;
    const paginatedGroups = sortedGroups.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      notifications: paginatedGroups,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    console.error('Error getting admin notifications:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Laden der Benachrichtigungen' 
    });
  }
}

// PATCH /notifications/:id
async function markAsRead(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    // Only allow user to mark their own notification as read
    const notification = await prisma.notificationLog.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
    }
    
    const updated = await prisma.notificationLog.update({
      where: { id },
      data: { read: true },
    });
    
    res.json({ success: true, notification: updated });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Aktualisieren der Benachrichtigung' 
    });
  }
}

// PATCH /notifications/bulk-read
async function markMultipleAsRead(req, res) {
  const { notificationIds } = req.body;
  const userId = req.user.id;
  
  if (!notificationIds || !Array.isArray(notificationIds)) {
    return res.status(400).json({ 
      success: false, 
      message: 'notificationIds Array erforderlich' 
    });
  }

  try {
    // Verify all notifications belong to the user
    const notifications = await prisma.notificationLog.findMany({
      where: { 
        id: { in: notificationIds },
        userId 
      }
    });

    if (notifications.length !== notificationIds.length) {
      return res.status(403).json({ 
        success: false, 
        message: 'Keine Berechtigung für alle Benachrichtigungen' 
      });
    }

    await prisma.notificationLog.updateMany({
      where: { 
        id: { in: notificationIds },
        userId 
      },
      data: { read: true }
    });

    res.json({ 
      success: true, 
      message: `${notifications.length} Benachrichtigung(en) als gelesen markiert` 
    });
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Markieren der Benachrichtigungen' 
    });
  }
}

// DELETE /notifications/:id
async function deleteNotification(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  
  try {
    // Only allow user to delete their own notification
    const notification = await prisma.notificationLog.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
    }
    
    await prisma.notificationLog.delete({ where: { id } });
    
    res.json({ success: true, message: 'Benachrichtigung gelöscht' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Fehler beim Löschen der Benachrichtigung' 
    });
  }
}

module.exports = { 
  registerToken, 
  sendNotification, 
  getRecipients,
  getNotifications, 
  getNotificationStats,
  getAdminNotifications,
  markAsRead, 
  markMultipleAsRead,
  deleteNotification 
}; 