const express = require('express');
const router = express.Router();
const { checkin, history, getCheckinStats, checkinByQR, getTodaysCheckins, getEducatorCheckinStats, correctCheckinTime } = require('../controllers/checkinController');
const { authMiddleware } = require('../middlewares/auth');

router.post('/checkin', authMiddleware, checkin);
router.post('/checkin/qr', authMiddleware, checkinByQR);
router.get('/checkin/child/:childId', authMiddleware, history);
router.get('/checkin/stats', authMiddleware, getCheckinStats);
router.get('/checkin/group/:groupId/today', authMiddleware, getTodaysCheckins);
router.get('/checkin/educator/:educatorId/stats', authMiddleware, getEducatorCheckinStats);
router.put('/checkin/correct-time', authMiddleware, correctCheckinTime);

module.exports = router; 