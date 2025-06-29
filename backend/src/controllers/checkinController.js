const prisma = require('../models/prismaClient');

// POST /checkin
async function checkin(req, res) {
  const { childId, type, method } = req.body;
  const actorId = req.user.id;
  if (!childId || !type || !method) {
    return res.status(400).json({ success: false, message: 'childId, type und method sind erforderlich' });
  }
  try {
    const log = await prisma.checkInLog.create({
      data: {
        childId,
        actorId,
        type,
        method,
        timestamp: new Date(), // always server time
      },
    });
    res.status(201).json(log);
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
  const { qrCodeSecret, type } = req.body;
  const actorId = req.user.id;
  if (!qrCodeSecret || !type) {
    return res.status(400).json({ success: false, message: 'qrCodeSecret und type sind erforderlich' });
  }
  try {
    const child = await prisma.child.findUnique({ where: { qrCodeSecret } });
    if (!child) return res.status(404).json({ success: false, message: 'Ungültiger QR-Code' });
    const log = await prisma.checkInLog.create({
      data: {
        childId: child.id,
        actorId,
        type,
        method: 'QR',
        timestamp: new Date(),
      },
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim QR Check-in/out' });
  }
}

module.exports = { checkin, history, childHistory, getCheckinStats, checkinByQR }; 