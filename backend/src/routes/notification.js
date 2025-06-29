const express = require('express');
const router = express.Router();
const { registerToken, sendNotification, getNotifications, markAsRead } = require('../controllers/notificationController');
const { authMiddleware } = require('../middlewares/auth');

router.post('/notifications/token', authMiddleware, registerToken);
router.post('/notifications/send', authMiddleware, sendNotification);
router.get('/notifications/:userId', authMiddleware, getNotifications);
router.patch('/notifications/:id', authMiddleware, markAsRead);

module.exports = router; 