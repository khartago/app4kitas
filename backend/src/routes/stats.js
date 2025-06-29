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
    const lateToday = req.user.role === 'ADMIN'
      ? await prisma.checkInLog.count({ where: { timestamp: { gte: today, lt: tomorrow, gt: new Date(today.getTime() + 8 * 60 * 60 * 1000) }, type: 'IN', childId: { in: childIds } } })
      : await prisma.checkInLog.count({ where: { timestamp: { gte: today, lt: tomorrow, gt: new Date(today.getTime() + 8 * 60 * 60 * 1000) }, type: 'IN' } });

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

    // Open tasks
    const openTasks = [];
    if (notCheckedOut > 0) {
      openTasks.push(`${notCheckedOut} Kinder noch nicht ausgecheckt`);
    }
    
    // Check for unexcused absences (children with no check-in today)
    const unexcusedAbsences = checkedInIds.length > 0 ? await prisma.child.count({
      where: {
        id: {
          notIn: checkedInIds
        }
      }
    }) : await prisma.child.count();

    if (unexcusedAbsences > 0) {
      openTasks.push(`${unexcusedAbsences} Abwesenheit${unexcusedAbsences > 1 ? 'en' : ''} unentschuldigt`);
    }

    res.json({
      users,
      admins,
      educators,
      parents,
      children,
      groups,
      checkins,
      messages,
      notifications,
      // Dashboard specific data
      attendanceToday: {
        checkedIn: checkedInTodayCount,
        absent: absentToday,
        late: lateToday
      },
      recentActivities: topActivities,
      openTasks
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Statistiken.' });
  }
});

module.exports = router; 