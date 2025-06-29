const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProfile, updateProfile, uploadAvatar } = require('../controllers/profileController');
const { authMiddleware } = require('../middlewares/auth');
const cors = require('cors');

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

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.options('/profile/avatar', cors());
router.post('/profile/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

module.exports = router; 