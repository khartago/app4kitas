const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { getRecentActivity, getUserActivity } = require('../controllers/activityController');
const { authMiddleware } = require('../middlewares/auth');

const prisma = new PrismaClient();

// Get recent activity logs (protected route)
router.get('/recent', authMiddleware, getRecentActivity);

// Get activity logs for a specific user (protected route)
router.get('/user/:userId', authMiddleware, getUserActivity);

// Get recent activity for a specific educator
router.get('/educator/:educatorId/recent', authMiddleware, async (req, res) => {
  try {
    const { educatorId } = req.params;
    
    // Get recent activity for the educator
    const activities = await prisma.activityLog.findMany({
      where: {
        userId: educatorId,
        OR: [
          { action: 'CHECKIN' },
          { action: 'CHECKOUT' },
          { action: 'MESSAGE_SENT' },
          { action: 'NOTE_CREATED' }
        ]
      },
      include: {
        child: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });
    
    res.json({ activities });
  } catch (err) {
    console.error('Error fetching educator activity:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Aktivitäten.' });
  }
});

module.exports = router; 