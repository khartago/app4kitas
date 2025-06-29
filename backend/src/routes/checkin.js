const express = require('express');
const router = express.Router();
const { checkin, history, getCheckinStats, checkinByQR } = require('../controllers/checkinController');
const { authMiddleware } = require('../middlewares/auth');

router.post('/checkin', authMiddleware, checkin);
router.get('/checkin/history/:childId', authMiddleware, history);
router.get('/checkin/child/:childId', authMiddleware, require('../controllers/checkinController').childHistory);
router.get('/checkin/stats', authMiddleware, getCheckinStats);
router.post('/checkin/qr', authMiddleware, checkinByQR);

module.exports = router; 