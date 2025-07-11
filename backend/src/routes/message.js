const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  sendMessage, 
  getMessagesByChild, 
  getMessagesByGroup,
  getUserChannels,
  getChannelMessages,
  getDirectMessages,
  getInstitutionUsers,
  toggleReaction,
  editMessage
} = require('../controllers/messageController');
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

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Dateityp nicht unterstützt'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// New comprehensive chat system routes
router.get('/channels', authMiddleware, getUserChannels);
router.get('/channels/:channelId/messages', authMiddleware, getChannelMessages);
router.get('/direct-messages/:otherUserId', authMiddleware, getDirectMessages);
router.get('/users/institution', authMiddleware, getInstitutionUsers);

// Send message (supports both channels and direct messages)
router.post('/message', authMiddleware, upload.single('file'), sendMessage);

// Message reactions and editing
router.post('/messages/:messageId/reactions', authMiddleware, toggleReaction);
router.put('/messages/:messageId', authMiddleware, editMessage);

// Legacy routes for backward compatibility
router.get('/messages/child/:childId', authMiddleware, getMessagesByChild);
router.get('/messages/group/:groupId', authMiddleware, getMessagesByGroup);

module.exports = router; 