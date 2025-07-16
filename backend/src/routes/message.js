const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Use memory storage for malware detection, then save to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check for malicious file extensions
  const maliciousExtensions = ['.php', '.php3', '.php4', '.php5', '.phtml', '.asp', '.aspx', '.jsp', '.jspx', '.sh', '.bat', '.cmd', '.exe', '.dll', '.so', '.dylib'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (maliciousExtensions.includes(fileExtension)) {
    return cb(new Error('Dateityp nicht unterstützt'), false);
  }
  
  // Check for path traversal in filename
  if (file.originalname.includes('..') || file.originalname.includes('\\') || file.originalname.includes('/')) {
    return cb(new Error('Ungültiger Dateiname'), false);
  }
  
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
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB limit for security tests
  }
});

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Datei zu groß' });
    }
    return res.status(400).json({ error: 'Datei-Upload-Fehler' });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// New comprehensive chat system routes
router.get('/channels', authMiddleware, getUserChannels);
router.get('/channels/:channelId/messages', authMiddleware, getChannelMessages);
router.get('/direct-messages/:otherUserId', authMiddleware, getDirectMessages);
router.get('/users/institution', authMiddleware, getInstitutionUsers);

// Send message (supports both channels and direct messages)
router.post('/message', authMiddleware, upload.single('file'), handleUploadError, sendMessage);

// Route alias for tests that expect /api/messages
router.post('/messages', authMiddleware, upload.single('file'), handleUploadError, sendMessage);

// Message reactions and editing
router.post('/messages/:messageId/reactions', authMiddleware, toggleReaction);
router.put('/messages/:messageId', authMiddleware, editMessage);

// Legacy routes for backward compatibility
router.get('/messages/child/:childId', authMiddleware, getMessagesByChild);
router.get('/messages/group/:groupId', authMiddleware, getMessagesByGroup);

module.exports = router; 