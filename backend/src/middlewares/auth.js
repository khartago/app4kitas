const { verifyToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  let token = null;
  // Check for token in cookies first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else {
    // Fallback to Authorization header
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Ungültiges Authorization-Header Format' });
      }
      token = parts[1];
    }
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Token fehlt' });
  }
  
  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Ungültiger Token' });
  }
}

function requireRole(role) {
  return function (req, res, next) {
    authMiddleware(req, res, function () {
      if (!req.user) {
        return res.status(401).json({ error: 'Token fehlt' });
      }
      if (req.user.role !== role) {
        return res.status(403).json({ error: 'Keine Berechtigung' });
      }
      next();
    });
  };
}

function requireSuperAdmin(req, res, next) {
  authMiddleware(req, res, function () {
    if (!req.user) {
      return res.status(401).json({ error: 'Token fehlt' });
    }
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Nur Super Admin kann auf diese Funktion zugreifen' });
    }
    next();
  });
}

module.exports = {
  authMiddleware,
  requireRole,
  requireSuperAdmin,
}; 