const prisma = require('../models/prismaClient');
const { signToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

// POST /register (nur SUPER_ADMIN)
async function register(req, res) {
  const { email, password, name, role, institutionId } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ success: false, message: 'Alle Felder sind erforderlich' });
  }
  // Nur SUPER_ADMIN darf registrieren
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Keine Berechtigung' });
  }
  
  // Für ADMIN und EDUCATOR ist institutionId erforderlich
  if ((role === 'ADMIN' || role === 'EDUCATOR') && !institutionId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Institution ID ist für ADMIN und EDUCATOR Benutzer erforderlich' 
    });
  }
  
  try {
    const hashed = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashed, 
        name, 
        role, 
        institutionId: (role === 'ADMIN' || role === 'EDUCATOR') ? institutionId : null 
      }
    });
    
    res.status(201).json({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role, 
      institutionId: user.institutionId 
    });
  } catch (err) {
    res.status(400).json({ success: false, message: 'E-Mail bereits vergeben oder ungültig' });
  }
}

// POST /login
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'E-Mail und Passwort erforderlich' });
  }
  const user = await prisma.user.findUnique({ where: { email }, include: { institution: true } });
  if (!user) {
    // Log failed login
    await prisma.failedLogin.create({
      data: {
        email,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    });
    return res.status(401).json({ success: false, message: 'Ungültige Anmeldedaten' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    // Log failed login
    await prisma.failedLogin.create({
      data: {
        email,
        ip: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    });
    return res.status(401).json({ success: false, message: 'Ungültige Anmeldedaten' });
  }
  // Add institutionId to JWT for ADMIN/EDUCATOR
  const token = signToken({
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    institutionId: (user.role === 'ADMIN' || user.role === 'EDUCATOR') ? user.institutionId : undefined
  });
  res.cookie('token', token, {
    httpOnly: true,
    secure: false, // true in production with HTTPS
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
  });
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl, institutionId: user.institutionId } });
}

module.exports = { register, login }; 