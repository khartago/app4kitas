const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { sendMessage, getMessagesByChild } = require('../controllers/messageController');
const { authMiddleware } = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post('/message', authMiddleware, upload.single('file'), sendMessage);
router.get('/messages/child/:childId', authMiddleware, getMessagesByChild);

module.exports = router; 