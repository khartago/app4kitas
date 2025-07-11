const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middlewares/auth');

const prisma = new PrismaClient();

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userInstitutionFilter = req.user.role === 'ADMIN' ? { institutionId: req.user.institutionId } : {};

    const users = await prisma.user.count({ where: userInstitutionFilter });
    const admins = await prisma.user.count({ where: { role: 'ADMIN', ...userInstitutionFilter } });
    const educators = await prisma.user.count({ where: { role: 'EDUCATOR', ...userInstitutionFilter } });
    const parents = await prisma.user.count({ where: { role: 'PARENT', ...userInstitutionFilter } });
    const children = await prisma.child.count({ where: userInstitutionFilter });
    const groups = await prisma.group.count({ where: userInstitutionFilter });
    // For checkins, messages, notifications, filter by children in institution
    let childIds = [];
    if (req.user.role === 'ADMIN') {
      childIds = (await prisma.child.findMany({ where: { institutionId: req.user.institutionId }, select: { id: true } })).map(c => c.id);
    }
    const checkins = req.user.role === 'ADMIN'
      ? await prisma.checkInLog.count({ where: { childId: { in: childIds } } })
      : await prisma.checkInLog.count();
    const messages = req.user.role === 'ADMIN'
      ? await prisma.message.count({ where: { childId: { in: childIds } } })
      : await prisma.message.count();
    const notifications = req.user.role === 'ADMIN'
      ? await prisma.notificationLog.count({ where: { userId: { in: (await prisma.user.findMany({ where: userInstitutionFilter, select: { id: true } })).map(u => u.id) } } })
      : await prisma.notificationLog.count();

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's check-ins
    const todayCheckins = req.user.role === 'ADMIN'
      ? await prisma.checkInLog.count({ where: { timestamp: { gte: today, lt: tomorrow }, type: 'IN', childId: { in: childIds } } })
      : await prisma.checkInLog.count({ where: { timestamp: { gte: today, lt: tomorrow }, type: 'IN' } });

    // Get children not checked out today (checked in but no check-out)
    const checkedInToday = req.user.role === 'ADMIN'
      ? await prisma.checkInLog.findMany({ where: { timestamp: { gte: today, lt: tomorrow }, type: 'IN', childId: { in: childIds } }, select: { childId: true } })
      : await prisma.checkInLog.findMany({ where: { timestamp: { gte: today, lt: tomorrow }, type: 'IN' }, select: { childId: true } });
    const checkedOutToday = req.user.role === 'ADMIN'
      ? await prisma.checkInLog.findMany({ where: { timestamp: { gte: today, lt: tomorrow }, type: 'OUT', childId: { in: childIds } }, select: { childId: true } })
      : await prisma.checkInLog.findMany({ where: { timestamp: { gte: today, lt: tomorrow }, type: 'OUT' }, select: { childId: true } });
    const checkedInIds = checkedInToday.map(log => log.childId);
    const checkedOutIds = checkedOutToday.map(log => log.childId);
    const notCheckedOut = checkedInIds.filter(id => !checkedOutIds.includes(id)).length;

    // Get recent activities (last 10 check-ins)
    const recentCheckins = req.user.role === 'ADMIN'
      ? await prisma.checkInLog.findMany({ where: { timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, childId: { in: childIds } }, include: { child: { select: { name: true } } }, orderBy: { timestamp: 'desc' }, take: 10 })
      : await prisma.checkInLog.findMany({ where: { timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, include: { child: { select: { name: true } } }, orderBy: { timestamp: 'desc' }, take: 10 });

    // Get recent messages (last 10)
    const recentMessages = req.user.role === 'ADMIN'
      ? await prisma.message.findMany({ where: { childId: { in: childIds } }, orderBy: { createdAt: 'desc' }, take: 10, include: { sender: { select: { name: true, role: true } }, child: { select: { name: true } }, group: { select: { name: true } } } })
      : await prisma.message.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { sender: { select: { name: true, role: true } }, child: { select: { name: true } }, group: { select: { name: true } } } });

    // Get recent notifications (last 10)
    const userIds = req.user.role === 'ADMIN' ? (await prisma.user.findMany({ where: userInstitutionFilter, select: { id: true } })).map(u => u.id) : undefined;
    const recentNotifications = req.user.role === 'ADMIN'
      ? await prisma.notificationLog.findMany({ where: { userId: { in: userIds } }, orderBy: { createdAt: 'desc' }, take: 10 })
      : await prisma.notificationLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });

    // Calculate attendance stats
    const totalChildrenToday = req.user.role === 'ADMIN'
      ? await prisma.child.count({ where: userInstitutionFilter })
      : await prisma.child.count();
    const checkedInTodayCount = todayCheckins;
    const absentToday = totalChildrenToday - checkedInTodayCount;
    let lateToday = 0;
    if (req.user.role === 'ADMIN') {
      // Get opening time for this institution
      const institution = await prisma.institution.findUnique({ where: { id: req.user.institutionId } });
      let openingHour = 8, openingMinute = 0;
      if (institution && institution.openingTime) {
        const [h, m] = institution.openingTime.split(':');
        openingHour = parseInt(h, 10);
        openingMinute = parseInt(m || '0', 10);
      }
      const openingDate = new Date(today);
      openingDate.setHours(openingHour, openingMinute, 0, 0);
      lateToday = await prisma.checkInLog.count({
        where: {
          timestamp: { gte: today, lt: tomorrow, gt: openingDate },
          type: 'IN',
          childId: { in: childIds }
        }
      });
    } else {
      // For SUPER_ADMIN, count all late check-ins (per institution opening time if possible)
      const institutions = await prisma.institution.findMany();
      let totalLate = 0;
      for (const inst of institutions) {
        let openingHour = 8, openingMinute = 0;
        if (inst.openingTime) {
          const [h, m] = inst.openingTime.split(':');
          openingHour = parseInt(h, 10);
          openingMinute = parseInt(m || '0', 10);
        }
        const openingDate = new Date(today);
        openingDate.setHours(openingHour, openingMinute, 0, 0);
        const instChildIds = (await prisma.child.findMany({ where: { institutionId: inst.id }, select: { id: true } })).map(c => c.id);
        if (instChildIds.length > 0) {
          const lateCount = await prisma.checkInLog.count({
            where: {
              timestamp: { gte: today, lt: tomorrow, gt: openingDate },
              type: 'IN',
              childId: { in: instChildIds }
            }
          });
          totalLate += lateCount;
        }
      }
      lateToday = totalLate;
    }

    // Combine recent activities
    const recentActivities = [];
    
    // Add check-ins
    recentCheckins.forEach(checkin => {
      const time = new Date(checkin.timestamp).toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      recentActivities.push({
        type: 'checkin',
        text: `${checkin.child.name} eingecheckt (${time})`,
        timestamp: checkin.timestamp
      });
    });

    // Add messages
    recentMessages.forEach(message => {
      let recipientName = '';
      if (message.child) {
        recipientName = message.child.name;
      } else if (message.group) {
        recipientName = `Gruppe ${message.group.name}`;
      } else {
        recipientName = 'Unbekannt';
      }

      const senderName = message.sender.role === 'PARENT' ? 
        `Eltern von ${recipientName}` : 
        message.sender.name;
      const content = message.content || '';
      const truncatedContent = content.length > 30 ? content.substring(0, 30) + '...' : content;
      recentActivities.push({
        type: 'message',
        text: `Neue Nachricht von ${senderName}: "${truncatedContent}"`,
        timestamp: message.createdAt
      });
    });

    // Add notifications
    recentNotifications.forEach(notification => {
      const title = notification.title || 'Benachrichtigung';
      recentActivities.push({
        type: 'notification',
        text: `Benachrichtigung gesendet: "${title}"`,
        timestamp: notification.createdAt
      });
    });

    // Sort by timestamp and take top 5
    recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const topActivities = recentActivities.slice(0, 5);


    
    // For SUPER_ADMIN, also include institution count and activity count
    let institutionen = 0;
    let activity = 0;
    let activeUsers = 0;
    let failedLogins = 0;
    let trends = {
      users: { up: false, value: 0 },
      institutionen: { up: false, value: 0 },
      activity: { up: false, value: 0 },
      checkins: { up: false, value: 0 },
      messages: { up: false, value: 0 },
      notifications: { up: false, value: 0 },
      activeUsers: { up: false, value: 0 },
      admins: { up: false, value: 0 },
      educators: { up: false, value: 0 },
      parents: { up: false, value: 0 },
      children: { up: false, value: 0 },
      groups: { up: false, value: 0 },
      lateCheckins: { up: false, value: 0 },
      failedLogins: { up: false, value: 0 }
    };
    
    if (req.user.role === 'SUPER_ADMIN') {
      institutionen = await prisma.institution.count();
      activity = await prisma.activityLog.count();
      
      // Calculate active users (users with activity in last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      activeUsers = await prisma.user.count({
        where: {
          OR: [
            { createdAt: { gte: sevenDaysAgo } },
            { activityLogs: { some: { createdAt: { gte: sevenDaysAgo } } } },
            { checkIns: { some: { timestamp: { gte: sevenDaysAgo } } } },
            { messages: { some: { createdAt: { gte: sevenDaysAgo } } } }
          ]
        }
      });

      // Count failed logins
      failedLogins = await prisma.failedLogin.count();
      
      // Calculate trends by comparing current period with previous period
      const now = new Date();
      const currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
      const previousPeriodStart = new Date(currentPeriodStart.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days before that
      
      // Users trend (new users in last 7 days vs previous 7 days)
      const currentUsers = await prisma.user.count({
        where: { createdAt: { gte: currentPeriodStart } }
      });
      const previousUsers = await prisma.user.count({
        where: { 
          createdAt: { 
            gte: previousPeriodStart,
            lt: currentPeriodStart 
          } 
        }
      });
      
      // Institutions trend
      const currentInstitutions = await prisma.institution.count({
        where: { createdAt: { gte: currentPeriodStart } }
      });
      const previousInstitutions = await prisma.institution.count({
        where: { 
          createdAt: { 
            gte: previousPeriodStart,
            lt: currentPeriodStart 
          } 
        }
      });
      
      // Activity trend
      const currentActivity = await prisma.activityLog.count({
        where: { createdAt: { gte: currentPeriodStart } }
      });
      const previousActivity = await prisma.activityLog.count({
        where: { 
          createdAt: { 
            gte: previousPeriodStart,
            lt: currentPeriodStart 
          } 
        }
      });

      // Check-ins trend
      const currentCheckins = await prisma.checkInLog.count({
        where: { timestamp: { gte: currentPeriodStart } }
      });
      const previousCheckins = await prisma.checkInLog.count({
        where: { 
          timestamp: { 
            gte: previousPeriodStart,
            lt: currentPeriodStart 
          } 
        }
      });

      // Messages trend
      const currentMessages = await prisma.message.count({
        where: { createdAt: { gte: currentPeriodStart } }
      });
      const previousMessages = await prisma.message.count({
        where: { 
          createdAt: { 
            gte: previousPeriodStart,
            lt: currentPeriodStart 
          } 
        }
      });
      
      // Calculate percentage changes
      trends.users = {
        up: currentUsers > previousUsers,
        value: previousUsers > 0 ? Math.round(((currentUsers - previousUsers) / previousUsers) * 100) : (currentUsers > 0 ? 100 : 0)
      };
      
      trends.institutionen = {
        up: currentInstitutions > previousInstitutions,
        value: previousInstitutions > 0 ? Math.round(((currentInstitutions - previousInstitutions) / previousInstitutions) * 100) : (currentInstitutions > 0 ? 100 : 0)
      };
      
      trends.activity = {
        up: currentActivity > previousActivity,
        value: previousActivity > 0 ? Math.round(((currentActivity - previousActivity) / previousActivity) * 100) : (currentActivity > 0 ? 100 : 0)
      };

      trends.checkins = {
        up: currentCheckins > previousCheckins,
        value: previousCheckins > 0 ? Math.round(((currentCheckins - previousCheckins) / previousCheckins) * 100) : (currentCheckins > 0 ? 100 : 0)
      };

      trends.messages = {
        up: currentMessages > previousMessages,
        value: previousMessages > 0 ? Math.round(((currentMessages - previousMessages) / previousMessages) * 100) : (currentMessages > 0 ? 100 : 0)
      };

      // Calculate trends for other stats (simplified to avoid division by zero)
      trends.activeUsers = {
        up: activeUsers > 0,
        value: activeUsers > 0 ? 100 : 0
      };
      trends.admins = {
        up: admins > 0,
        value: admins > 0 ? 100 : 0
      };
      trends.educators = {
        up: educators > 0,
        value: educators > 0 ? 100 : 0
      };
      trends.parents = {
        up: parents > 0,
        value: parents > 0 ? 100 : 0
      };
      trends.children = {
        up: children > 0,
        value: children > 0 ? 100 : 0
      };
      trends.groups = {
        up: groups > 0,
        value: groups > 0 ? 100 : 0
      };
      trends.lateCheckins = {
        up: lateToday > 0,
        value: lateToday > 0 ? 100 : 0
      };
      trends.notifications = {
        up: notifications > 0,
        value: notifications > 0 ? 100 : 0
      };
      trends.failedLogins = {
        up: failedLogins > 0,
        value: failedLogins > 0 ? 100 : 0
      };
    }

    res.json({
      users,
      admins,
      educators,
      parents,
      children,
      groups,
      institutionen,
      activity,
      trends,
      checkins,
      messages,
      notifications,
      // Add missing fields for frontend
      activeUsers: req.user.role === 'SUPER_ADMIN' ? activeUsers : 0,
      lateCheckins: lateToday,
      failedLogins: req.user.role === 'SUPER_ADMIN' ? failedLogins : 0,
      // Dashboard specific data
      attendanceToday: {
        checkedIn: checkedInTodayCount,
        absent: absentToday,
        late: lateToday
      },
      recentActivities: topActivities
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Statistiken.' });
  }
});

module.exports = router; 