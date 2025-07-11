const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');
const { signToken, verifyToken } = require('../utils/jwt');
const prisma = require('../models/prismaClient');

router.post('/register', authMiddleware, register); // Nur SUPER_ADMIN
router.post('/login', login);
router.post('/logout', logout);

router.post('/refresh-token', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token fehlt' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ error: 'Benutzer nicht gefunden' });
    const newToken = signToken({ id: user.id, role: user.role, email: user.email, name: user.name, avatarUrl: user.avatarUrl });
    res.json({ token: newToken });
  } catch {
    res.status(401).json({ error: 'Ungültiger oder abgelaufener Token' });
  }
});

module.exports = router; 