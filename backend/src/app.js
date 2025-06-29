require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

// Trust proxy for rate limiting when behind a proxy - only trust localhost
app.set('trust proxy', '127.0.0.1');

// Security headers
app.use(helmet());

// Rate limiting: 100 requests/minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Zu viele Anfragen, bitte warte eine Minute.' },
});
app.use(limiter);

// CORS with whitelist
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

app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: 'CORS-Fehler: Zugriff nicht erlaubt.' });
  }
  res.status(500).json({ error: 'Interner Serverfehler' });
});

module.exports = app; 