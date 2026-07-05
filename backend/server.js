const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const db = require('./config/db');
const errorMiddleware = require('./middlewares/errorMiddleware');
const rateLimiter = require('./middlewares/rateLimiter');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading uploaded avatars from frontend
}));

// CORS Configuration
app.use(cors({
  origin: '*', // In production, specify the client origin e.g. http://localhost:5173
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Standard logger
app.use(morgan('dev'));

// Uploads static directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Custom API Log Interceptor to write into `api_logs`
app.use(async (req, res, next) => {
  const startTime = Date.now();
  
  // Save original res.end to intercept status
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - startTime;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userId = req.user ? req.user.id : null;

    // Do not log static uploads or suggestions to keep log quiet
    if (!req.originalUrl.includes('/uploads') && !req.originalUrl.includes('/suggestions')) {
      db.query(
        'INSERT INTO api_logs (user_id, endpoint, method, status_code, response_time_ms, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, req.originalUrl, req.method, res.statusCode, duration, ip]
      ).catch(err => console.error('Failed writing API log to DB:', err.message));
    }
    
    originalEnd.apply(res, args);
  };
  
  next();
});

// Rate limiting (General limit: 200 requests per 15 mins)
app.use(rateLimiter(200, 15 * 60 * 1000));

// Import routes
const authRoutes = require('./routes/authRoutes');
const researchRoutes = require('./routes/researchRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Mount routes (Matching API specifications)
app.use('/api/auth', authRoutes);    // /api/auth/register, /api/auth/login
app.use('/api', authRoutes);         // /api/profile and backward-compatible auth routes
app.use('/api', researchRoutes);     // /api/research, /api/history, /api/report/*, /api/save-report
app.use('/api', bookmarkRoutes);     // /api/bookmark, /api/bookmarks
app.use('/api', dashboardRoutes);    // /api/dashboard, /api/analytics
app.use('/api', settingsRoutes);     // /api/settings

// Catch-all 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handler
app.use(errorMiddleware);

// Initialize DB and start server
db.getDb().then(() => {
  const server = app.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`InvestIQ Server is running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Local Server Address: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\nPort ${PORT} is already in use.`);
      console.error('Stop the existing process or start this server with a different PORT value.');
      console.error('Example: $env:PORT=5001; npm start\n');
      process.exit(1);
    }

    throw err;
  });
}).catch(err => {
  console.error('Database connection failed catastrophically:', err);
  process.exit(1);
});


