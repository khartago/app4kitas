const prisma = require('../models/prismaClient');
const { signToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const { logActivity } = require('./activityController');

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
    
    // Log activity
    await logActivity(
      req.user.id,
      'USER_CREATED',
      'User',
      user.id,
      `Created ${role} user: ${name} (${email})`,
      institutionId || null,
      null
    );
    
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
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'E-Mail und Passwort erforderlich' });
    }
    const user = await prisma.user.findUnique({ where: { email }, include: { institution: true } });
    if (!user) {
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
      await prisma.failedLogin.create({
        data: {
          email,
          ip: req.ip,
          userAgent: req.headers['user-agent'] || null,
        },
      });
      return res.status(401).json({ success: false, message: 'Ungültige Anmeldedaten' });
    }
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
    
    // Log login activity
    await logActivity(
      user.id,
      'USER_LOGIN',
      'User',
      user.id,
      `User logged in: ${user.name} (${user.email})`,
      user.institutionId || null,
      null
    );
    
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl, institutionId: user.institutionId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Interner Serverfehler beim Login' });
  }
}

// POST /logout
async function logout(req, res) {
  // Log logout activity
  if (req.user) {
    await logActivity(
      req.user.id,
      'USER_LOGOUT',
      'User',
      req.user.id,
      `User logged out: ${req.user.name} (${req.user.email})`,
      req.user.institutionId || null,
      null
    );
  }

  // Clear the token cookie with the same options it was set with
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // true in production with HTTPS
    sameSite: 'lax',
    path: '/',
    expires: new Date(0)
  });
  
  res.json({ success: true });
}

module.exports = {
  register,
  login,
  logout,
}; 