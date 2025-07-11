const prisma = require('../models/prismaClient');
const { logActivity } = require('./activityController');

// POST /checkin
async function checkin(req, res) {
  const { childId, method } = req.body;
  const actorId = req.user.id;
  if (!childId || !method) {
    return res.status(400).json({ success: false, message: 'childId und method sind erforderlich' });
  }
  try {
    // Get today's logs for this child
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogs = await prisma.checkInLog.findMany({
      where: {
        childId,
        timestamp: { gte: today, lt: tomorrow }
      },
      orderBy: { timestamp: 'asc' }
    });

    if (todayLogs.length === 0) {
      // First scan: check-in
      const log = await prisma.checkInLog.create({
        data: { childId, actorId, type: 'IN', method, timestamp: new Date() },
      });
      
      // Log activity
      await logActivity(
        actorId,
        'CHECKIN_RECORDED',
        'Child',
        childId,
        `Check-in recorded for child`
      );
      
      return res.status(201).json(log);
    } else if (todayLogs.length === 1 && todayLogs[0].type === 'IN') {
      // Second scan: check-out
      const log = await prisma.checkInLog.create({
        data: { childId, actorId, type: 'OUT', method, timestamp: new Date() },
      });
      
      // Log activity
      await logActivity(
        actorId,
        'CHECKIN_RECORDED',
        'Child',
        childId,
        `Check-out recorded for child`
      );
      
      return res.status(201).json(log);
    } else if (todayLogs.length === 2 || (todayLogs.length === 1 && todayLogs[0].type === 'OUT')) {
      // Already checked in and out
      return res.status(400).json({ success: false, message: 'Kind ist heute bereits ein- und ausgecheckt.' });
    } else {
      // Fallback: reject
      return res.status(400).json({ success: false, message: 'Ungültiger Check-in/Check-out Status.' });
    }
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim Check-in/out' });
  }
}

// GET /checkin/child/:childId
async function childHistory(req, res) {
  const { childId } = req.params;
  try {
    const logs = await prisma.checkInLog.findMany({
      where: { childId },
      orderBy: { timestamp: 'desc' },
    });
    res.json(logs);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim Laden der Historie' });
  }
}

// GET /checkin/history/:childId (alias)
async function history(req, res) {
  return childHistory(req, res);
}

// GET /checkin/stats
async function getCheckinStats(req, res) {
  const user = req.user;
  
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Keine Berechtigung für Check-in Statistiken' });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's check-ins
    const todayCheckins = await prisma.checkInLog.findMany({
      where: {
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        child: {
          include: {
            group: true
          }
        }
      }
    });

    // Get total check-ins by type
    const totalCheckins = await prisma.checkInLog.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    });

    // Get check-ins by method
    const checkinsByMethod = await prisma.checkInLog.groupBy({
      by: ['method'],
      _count: {
        method: true
      }
    });

    // Get recent check-ins (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentCheckins = await prisma.checkInLog.findMany({
      where: {
        timestamp: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10,
      include: {
        child: {
          select: {
            name: true
          }
        },
        actor: {
          select: {
            name: true
          }
        }
      }
    });

    const stats = {
      today: {
        total: todayCheckins.length,
        checkins: todayCheckins.filter(c => c.type === 'IN').length,
        checkouts: todayCheckins.filter(c => c.type === 'OUT').length
      },
      total: {
        checkins: totalCheckins.find(c => c.type === 'IN')?._count.type || 0,
        checkouts: totalCheckins.find(c => c.type === 'OUT')?._count.type || 0
      },
      byMethod: {
        qr: checkinsByMethod.find(c => c.method === 'QR')?._count.method || 0,
        manual: checkinsByMethod.find(c => c.method === 'MANUAL')?._count.method || 0
      },
      recent: recentCheckins.map(c => ({
        childName: c.child.name,
        actorName: c.actor.name,
        type: c.type,
        method: c.method,
        timestamp: c.timestamp
      }))
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Laden der Check-in Statistiken' });
  }
}

// POST /checkin/qr
async function checkinByQR(req, res) {
  const { qrCodeSecret, method } = req.body;
  const actorId = req.user.id;
  if (!qrCodeSecret || !method) {
    return res.status(400).json({ success: false, message: 'qrCodeSecret und method sind erforderlich' });
  }
  try {
    const child = await prisma.child.findUnique({ where: { qrCodeSecret } });
    if (!child) return res.status(404).json({ success: false, message: 'Ungültiger QR-Code' });

    // Get today's logs for this child
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogs = await prisma.checkInLog.findMany({
      where: {
        childId: child.id,
        timestamp: { gte: today, lt: tomorrow }
      },
      orderBy: { timestamp: 'asc' }
    });

    if (todayLogs.length === 0) {
      // First scan: check-in
      const log = await prisma.checkInLog.create({
        data: { childId: child.id, actorId, type: 'IN', method: 'QR', timestamp: new Date() },
      });
      return res.status(201).json(log);
    } else if (todayLogs.length === 1 && todayLogs[0].type === 'IN') {
      // Second scan: check-out
      const log = await prisma.checkInLog.create({
        data: { childId: child.id, actorId, type: 'OUT', method: 'QR', timestamp: new Date() },
      });
      return res.status(201).json(log);
    } else if (todayLogs.length === 2 || (todayLogs.length === 1 && todayLogs[0].type === 'OUT')) {
      // Already checked in and out
      return res.status(400).json({ success: false, message: 'Kind ist heute bereits ein- und ausgecheckt.' });
    } else {
      // Fallback: reject
      return res.status(400).json({ success: false, message: 'Ungültiger Check-in/Check-out Status.' });
    }
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim QR Check-in/out' });
  }
}

// GET /checkin/group/:groupId/today - Get today's check-ins for a group
async function getTodaysCheckins(req, res) {
  const { groupId } = req.params;
  const user = req.user;
  
  try {
    // Check if user is educator in this group or has admin access
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { educators: true }
    });
    
    if (!group) {
      return res.status(404).json({ error: 'Gruppe nicht gefunden' });
    }
    
    const isEducator = group.educators.some(e => e.id === user.id);
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    
    if (!isEducator && !isAdmin) {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    
    // Institution check for admin
    if (user.role !== 'SUPER_ADMIN' && group.institutionId !== user.institutionId) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get today's check-ins for children in this group
    const todaysCheckins = await prisma.checkInLog.findMany({
      where: {
        child: {
          groupId: groupId
        },
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        child: {
          select: {
            id: true,
            name: true,
            birthdate: true
          }
        },
        actor: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    // Group by child and determine status
    const childrenStatus = {};
    todaysCheckins.forEach(log => {
      if (!childrenStatus[log.childId]) {
        childrenStatus[log.childId] = {
          child: log.child,
          checkins: [],
          status: 'NOT_CHECKED_IN'
        };
      }
      childrenStatus[log.childId].checkins.push(log);
      
      if (log.type === 'IN') {
        childrenStatus[log.childId].status = 'CHECKED_IN';
      } else if (log.type === 'OUT') {
        childrenStatus[log.childId].status = 'CHECKED_OUT';
      }
    });
    
    res.json(Object.values(childrenStatus));
  } catch (err) {
    console.error('Error getting today\'s check-ins:', err);
    res.status(500).json({ error: 'Fehler beim Laden der heutigen Check-ins' });
  }
}

// GET /checkin/educator/:educatorId/stats - Get check-in statistics for an educator
async function getEducatorCheckinStats(req, res) {
  const { educatorId } = req.params;
  const user = req.user;
  
  try {
    // Check if user is requesting their own stats or has admin access
    if (user.id !== educatorId && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Keine Berechtigung' });
    }
    
    // Get the educator's group
    const group = await prisma.group.findFirst({
      where: {
        educators: {
          some: {
            id: educatorId
          }
        }
      },
      include: {
        children: true
      }
    });
    
    if (!group) {
      return res.status(404).json({ error: 'Keine Gruppe für diesen Erzieher gefunden' });
    }
    
    // Institution check for admin
    if (user.role !== 'SUPER_ADMIN' && group.institutionId !== user.institutionId) {
      return res.status(403).json({ error: 'Keine Berechtigung (Institution)' });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get today's check-ins for children in this group
    const todaysCheckins = await prisma.checkInLog.findMany({
      where: {
        child: {
          groupId: group.id
        },
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    // Calculate statistics
    const totalChildren = group.children.length;
    const checkedInCount = todaysCheckins.filter(log => log.type === 'IN').length;
    const checkedOutCount = todaysCheckins.filter(log => log.type === 'OUT').length;
    const presentCount = todaysCheckins.filter(log => log.type === 'IN').length;
    const absentCount = totalChildren - presentCount;
    
    res.json({
      total: totalChildren,
      checkedIn: checkedInCount,
      checkedOut: checkedOutCount,
      present: presentCount,
      absent: absentCount
    });
  } catch (err) {
    console.error('Error getting educator check-in stats:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Check-in Statistiken' });
  }
}

// PUT /checkin/correct-time - Correct check-in/out time
async function correctCheckinTime(req, res) {
  const { childId, type, newTime } = req.body;
  const actorId = req.user.id;
  
  if (!childId || !type || !newTime) {
    return res.status(400).json({ success: false, message: 'childId, type und newTime sind erforderlich' });
  }
  
  try {
    // Validate the child exists and user has permission
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        group: {
          include: {
            educators: true
          }
        }
      }
    });
    
    if (!child) {
      return res.status(404).json({ success: false, message: 'Kind nicht gefunden' });
    }
    
    // Check if user is educator in child's group or has admin access
    const isEducator = child.group?.educators.some(e => e.id === actorId);
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';
    
    if (!isEducator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
    }
    
    // Institution check for admin
    if (req.user.role !== 'SUPER_ADMIN' && child.institutionId !== req.user.institutionId) {
      return res.status(403).json({ success: false, message: 'Keine Berechtigung (Institution)' });
    }
    
    // Parse the new time
    const correctedTime = new Date(newTime);
    if (isNaN(correctedTime.getTime())) {
      return res.status(400).json({ success: false, message: 'Ungültiges Zeitformat' });
    }
    
    // Get today's check-in logs for this child
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysLogs = await prisma.checkInLog.findMany({
      where: {
        childId,
        timestamp: { gte: today, lt: tomorrow },
        type
      },
      orderBy: { timestamp: 'desc' }
    });
    
    if (todaysLogs.length === 0) {
      return res.status(404).json({ success: false, message: 'Kein Check-in/out für heute gefunden' });
    }
    
    // Update the most recent log of the specified type
    const logToUpdate = todaysLogs[0];
    const updatedLog = await prisma.checkInLog.update({
      where: { id: logToUpdate.id },
      data: { timestamp: correctedTime }
    });
    
    // Log activity
    await logActivity(
      actorId,
      'CHECKIN_TIME_CORRECTED',
      'CheckIn',
      childId,
      `Check-in time corrected for ${child.name} (${type})`
    );
    
    res.json({ success: true, log: updatedLog });
  } catch (err) {
    console.error('Error correcting check-in time:', err);
    res.status(500).json({ success: false, message: 'Fehler bei der Zeitkorrektur' });
  }
}

module.exports = {
  checkin,
  history,
  getCheckinStats,
  checkinByQR,
  getTodaysCheckins,
  getEducatorCheckinStats,
  correctCheckinTime
}; 