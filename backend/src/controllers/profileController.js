const prisma = require('../models/prismaClient');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { sanitizeFileName, detectMalware } = require('../utils/sanitizer');

// GET /profile
async function getProfile(req, res) {
  const userId = req.user.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, institutionId: true }
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim Laden des Profils' });
  }
}

// PUT /profile
async function updateProfile(req, res) {
  const userId = req.user.id;
  const { name, email, password, avatarUrl } = req.body;
  const data = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (avatarUrl) data.avatarUrl = avatarUrl;
  if (password) data.password = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, role: true, avatarUrl: true }
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim Aktualisieren des Profils' });
  }
}

// POST /profile/avatar
async function uploadAvatar(req, res) {
  const userId = req.user.id;
  if (!req.file) return res.status(400).json({ success: false, message: 'Avatar erforderlich' });
  
  // Check for malware in uploaded file
  if (detectMalware(req.file.buffer, req.file.filename)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Suspicious file content detected. Upload rejected for security reasons.' 
    });
  }
  
  // Sanitize file name
  const safeFileName = sanitizeFileName(req.file.filename);
  const avatarUrl = `/uploads/${safeFileName}`;
  try {
    // Find old avatarUrl
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (existingUser && existingUser.avatarUrl) {
      const oldPath = require('path').join(__dirname, '../../', existingUser.avatarUrl);
      // Only delete if inside uploads
      if (oldPath.includes(require('path').join('uploads'))) {
        fs.unlink(oldPath, err => { /* ignore errors, file may not exist */ });
      }
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true }
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ success: false, message: 'Fehler beim Hochladen des Avatars' });
  }
}

module.exports = { getProfile, updateProfile, uploadAvatar }; 