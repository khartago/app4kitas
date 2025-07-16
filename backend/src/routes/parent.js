const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middlewares/auth');
const ActivityService = require('../services/activityService');

const prisma = new PrismaClient();

// GET /parent/children - Get all children for the authenticated parent
router.get('/children', authMiddleware, async (req, res) => {
  if (req.user.role !== 'PARENT') {
    return res.status(403).json({ error: 'Nur Eltern können auf diese Route zugreifen' });
  }

  try {
    const children = await prisma.child.findMany({
      where: {
        parents: {
          some: {
            id: req.user.id
          }
        },
        deletedAt: null
      },
      include: {
        group: true,
        parents: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({ children });
  } catch (err) {
    console.error('Error fetching parent children:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Kinder' });
  }
});

// GET /parent/children/:id - Get specific child details for parent
router.get('/children/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'PARENT') {
    return res.status(403).json({ error: 'Nur Eltern können auf diese Route zugreifen' });
  }

  const { id } = req.params;

  try {
    const child = await prisma.child.findFirst({
      where: {
        id,
        parents: {
          some: {
            id: req.user.id
          }
        },
        deletedAt: null
      },
      include: {
        group: true,
        parents: true
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Kind nicht gefunden oder keine Berechtigung' });
    }

    res.json(child);
  } catch (err) {
    console.error('Error fetching child:', err);
    res.status(500).json({ error: 'Fehler beim Laden des Kindes' });
  }
});

// PUT /parent/consent - Update parent's consent (affects all their children)
router.put('/consent', authMiddleware, async (req, res) => {
  if (req.user.role !== 'PARENT') {
    return res.status(403).json({ error: 'Nur Eltern können ihre Einwilligung ändern' });
  }

  const { consentGiven } = req.body;

  if (typeof consentGiven !== 'boolean') {
    return res.status(400).json({ error: 'consentGiven (Boolean) erforderlich' });
  }

  try {
    // Update the parent's consent
    const updateData = { consentGiven };
    if (consentGiven) {
      updateData.consentDate = new Date();
    } else {
      updateData.consentDate = null;
    }

    const updatedParent = await prisma.user.update({ 
      where: { id: req.user.id }, 
      data: updateData 
    });

    // Log activity
    await ActivityService.logUserActivity(
      req.user.id,
      'GDPR_PARENT_CONSENT_CHANGED',
      `Einwilligung für sensitive Datenverarbeitung geändert: ${consentGiven ? 'gegeben' : 'entzogen'} von Elternteil`,
      req.user.institutionId
    );

    res.json(updatedParent);
  } catch (err) {
    console.error('Error updating consent:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Einwilligung' });
  }
});

// GET /parent/consent-status - Get consent status for all children
router.get('/consent-status', authMiddleware, async (req, res) => {
  if (req.user.role !== 'PARENT') {
    return res.status(403).json({ error: 'Nur Eltern können auf diese Route zugreifen' });
  }

  try {
    const children = await prisma.child.findMany({
      where: {
        parents: {
          some: {
            id: req.user.id
          }
        },
        deletedAt: null
      },
      select: {
        id: true,
        name: true
      }
    });

    // Get current parent consent status from database
    const currentParent = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { consentGiven: true, consentDate: true }
    });
    const parentConsent = currentParent?.consentGiven || false;
    const parentConsentDate = currentParent?.consentDate;

    // Get detailed consent status for each child
    const consentStatus = await Promise.all(children.map(async (child) => {
      const childWithConsent = await prisma.child.findUnique({
        where: { id: child.id },
        select: {
          id: true,
          name: true,
          manualConsentGiven: true,
          manualConsentDate: true,
          manualConsentSetBy: true
        }
      });
      
      // Child has consent if manual consent OR parent has app consent
      const hasConsent = childWithConsent.manualConsentGiven || parentConsent;
      
      return {
        childId: child.id,
        childName: child.name,
        consentGiven: hasConsent,
        manualConsentGiven: childWithConsent.manualConsentGiven,
        manualConsentDate: childWithConsent.manualConsentDate,
        appConsentGiven: parentConsent,
        appConsentDate: parentConsentDate,
        consentType: childWithConsent.manualConsentGiven ? 'manual' : (parentConsent ? 'app' : 'none')
      };
    }));

    res.json({ 
      consentStatus,
      parentConsent: parentConsent,
      parentConsentDate: parentConsentDate
    });
  } catch (err) {
    console.error('Error fetching consent status:', err);
    res.status(500).json({ error: 'Fehler beim Laden des Zustimmungsstatus' });
  }
});

// GET /parent/notifications - Get notifications for parent
router.get('/notifications', authMiddleware, async (req, res) => {
  if (req.user.role !== 'PARENT') {
    return res.status(403).json({ error: 'Nur Eltern können auf diese Route zugreifen' });
  }

  try {
    const notifications = await prisma.notificationLog.findMany({
      where: {
        userId: req.user.id,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    res.json({ notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Benachrichtigungen' });
  }
});

// POST /parent/request-consent/:childId - Request consent for a child (admin only)
router.post('/request-consent/:childId', authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Nur Admins können Einwilligungsanfragen senden' });
  }

  const { childId } = req.params;

  try {
    // Verify admin has access to this child
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        institutionId: req.user.institutionId,
        deletedAt: null
      },
      include: {
        parents: true
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Kind nicht gefunden oder keine Berechtigung' });
    }

    if (child.parents.length === 0) {
      return res.status(400).json({ error: 'Kind hat keine zugeordneten Eltern' });
    }

    // Send consent request notification
    const { sendConsentRequestNotification } = require('../controllers/notificationController');
    const result = await sendConsentRequestNotification(childId, req.user.institutionId);

    if (result.success) {
      // Log activity
      await ActivityService.logChildActivity(
        req.user.id,
        'GDPR_CONSENT_REQUEST_SENT',
        childId,
        `Einwilligungsanfrage für ${child.name} gesendet`,
        req.user.institutionId,
        child.groupId || null
      );
    }

    res.json(result);
  } catch (err) {
    console.error('Error requesting consent:', err);
    res.status(500).json({ error: 'Fehler beim Senden der Einwilligungsanfrage' });
  }
});

module.exports = router; 