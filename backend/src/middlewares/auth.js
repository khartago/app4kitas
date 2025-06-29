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
      token = authHeader.split(' ')[1];
    }
  }
  if (!token) return res.status(401).json({ error: 'Token fehlt' });
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
      if (!req.user || req.user.role !== role) {
        return res.status(403).json({ error: 'Keine Berechtigung' });
      }
      next();
    });
  };
}

module.exports = {
  authMiddleware,
  requireRole,
}; 