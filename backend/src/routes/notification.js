const express = require('express');
const router = express.Router();
const { 
  registerToken, 
  sendNotification, 
  getRecipients,
  getNotifications, 
  getNotificationStats,
  getAdminNotifications,
  markAsRead, 
  markMultipleAsRead,
  deleteNotification 
} = require('../controllers/notificationController');
const { authMiddleware } = require('../middlewares/auth');

// Device token registration
router.post('/notifications/token', authMiddleware, registerToken);

// Send notifications
router.post('/notifications/send', authMiddleware, sendNotification);

// Get recipients (parents, educators, groups)
router.get('/notifications/recipients', authMiddleware, getRecipients);

// Get admin notifications (sent by admin) - MUST come before /:userId route
router.get('/notifications/admin', authMiddleware, getAdminNotifications);

// Get notification statistics
router.get('/notifications/stats/:userId', authMiddleware, getNotificationStats);

// Get notifications for a user
router.get('/notifications/:userId', authMiddleware, getNotifications);

// Mark notification as read
router.patch('/notifications/:id', authMiddleware, markAsRead);

// Mark multiple notifications as read
router.patch('/notifications/bulk-read', authMiddleware, markMultipleAsRead);

// Delete notification
router.delete('/notifications/:id', authMiddleware, deleteNotification);

module.exports = router; 