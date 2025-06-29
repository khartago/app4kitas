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
  const { userId, title, body } = req.body;
  if (!userId || !title || !body) {
    return res.status(400).json({ success: false, message: 'userId, title und body erforderlich' });
  }
  try {
    // Only allow admins to send to users in their own institution
    if (req.user.role === 'ADMIN') {
      const recipient = await prisma.user.findUnique({ where: { id: userId } });
      if (!recipient || recipient.institutionId !== req.user.institutionId) {
        return res.status(403).json({ success: false, message: 'Keine Berechtigung für diese Institution' });
      }
    }
    const notification = await prisma.notificationLog.create({
      data: { userId, title, body },
    });
    // TODO: Trigger FCM push here (stub)
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim Senden der Benachrichtigung' });
  }
}

// GET /notifications/:userId
async function getNotifications(req, res) {
  const { userId } = req.params;
  // Only allow user to see their own notifications or if admin
  if (req.user.id !== userId && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
  }
  try {
    // Only allow admins to view notifications for users in their own institution
    if (req.user.role === 'ADMIN') {
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser || targetUser.institutionId !== req.user.institutionId) {
        return res.status(403).json({ success: false, message: 'Keine Berechtigung für diese Institution' });
      }
    }
    const notifications = await prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim Laden der Benachrichtigungen' });
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
    res.json(updated);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim Aktualisieren der Benachrichtigung' });
  }
}

module.exports = { registerToken, sendNotification, getNotifications, markAsRead }; 