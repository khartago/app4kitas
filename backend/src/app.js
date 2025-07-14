require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const jwt = require('./utils/jwt');

// Trust proxy for rate limiting when behind a proxy - only trust localhost
app.set('trust proxy', '127.0.0.1');

// Security headers with custom configuration
app.use(helmet({
  frameguard: { action: 'deny' }, // Set X-Frame-Options to DENY
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true, // Enable X-Content-Type-Options
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Add X-XSS-Protection header manually since helmet doesn't set it correctly
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS with whitelist - apply BEFORE rate limiting
const whitelist = [
  'http://localhost:3000',
  'http://localhost:4000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4000',
  process.env.PROD_DOMAIN, // e.g. https://app4kitas.de
];
app.use('/api', cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (whitelist.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Nicht erlaubte Herkunft (CORS)'), false);
    }
  },
  credentials: true,
}));

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.PROD_DOMAIN
  ],
  credentials: true,
};

app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use('/uploads', cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve uploads also at /api/uploads
app.use('/api/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use('/api/uploads', cors(corsOptions));
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware to decode JWT and set req.user (for rate limiting)
app.use('/api', (req, res, next) => {
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
  if (token) {
    try {
      const user = jwt.verifyToken(token);
      req.user = user;
    } catch (e) {
      // Ignore invalid token, req.user remains undefined
    }
  }
  next();
});

// Check if we're in test environment
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID;

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isTestEnvironment ? 1000 : 5, // Much higher limit in tests
  message: { error: 'Zu viele Login-Versuche, bitte warte eine Minute.' },
  keyGenerator: (req) => req.ip,
  skip: (req) => isTestEnvironment, // Skip rate limiting in tests
});

const messagesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isTestEnvironment ? 1000 : 10, // Much higher limit in tests
  message: { error: 'Zu viele Nachrichten, bitte warte eine Minute.' },
  keyGenerator: (req) => req.user?.id || req.ip,
  skip: (req) => isTestEnvironment, // Skip rate limiting in tests
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isTestEnvironment ? 10000 : 100, // Much higher limit in tests
  message: { error: 'Zu viele Anfragen, bitte warte eine Minute.' },
  keyGenerator: (req) => req.user?.id || req.ip,
  skip: (req) => isTestEnvironment, // Skip rate limiting in tests
});

app.use('/api/login', loginLimiter);
app.use('/api/messages', messagesLimiter);
app.use('/api', apiLimiter);

app.use(express.json());
app.use(cookieParser());

app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/checkin'));
app.use('/api', require('./routes/message'));
app.use('/api', require('./routes/notification'));
app.use('/api', require('./routes/profile'));
app.use('/api', require('./routes/child'));
app.use('/api', require('./routes/group'));
app.use('/api', require('./routes/users'));
app.use('/api', require('./routes/stats'));
app.use('/api', require('./routes/reports'));
app.use('/api', require('./routes/institutionen'));
app.use('/api/institution-settings', require('./routes/institutionSettings'));
app.use('/api/personalTasks', require('./routes/personalTasks'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api', require('./routes/notes'));
app.use('/api/gdpr', require('./routes/gdprDeletion'));

// 404 handler for non-existent /api routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Route nicht gefunden' });
  }
  next();
});

app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: 'CORS-Fehler: Zugriff nicht erlaubt.' });
  }
  // Ensure error response is always an object
  if (typeof err === 'string') {
    return res.status(500).json({ error: err });
  }
  // Handle malformed JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Ungültiges JSON-Format' });
  }
  res.status(500).json({ error: 'Interner Serverfehler' });
});

module.exports = app; 