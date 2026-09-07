require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { mongoSanitizeMiddleware } = require('./middleware/securityMiddleware');
const { initCleanupCron } = require('./services/cleanupService');
const bookingRoutes = require('./routes/bookingRoutes');

// ===================================================
// 1. Startup Environment Validation
// ===================================================
function validateEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  const missingCritical = [];

  if (isProduction) {
    if (!process.env.MONGODB_URI) missingCritical.push('MONGODB_URI');
    if (!process.env.ACTION_TOKEN_SECRET) missingCritical.push('ACTION_TOKEN_SECRET');
  }

  if (missingCritical.length > 0) {
    console.error('❌ FATAL STARTUP ERROR: Missing required production environment variables:');
    missingCritical.forEach((varName) => console.error(`   - ${varName}`));
    console.error('Please configure them in your Render Dashboard Environment settings.');
    process.exit(1);
  }

  // Informational warnings for optional integrations
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.warn('⚠️ Warning: Google Service Account credentials not provided. Google Calendar & Meet links will run in simulation mode.');
  }
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ Warning: SMTP credentials not provided. Transactional emails will run in preview / console mode.');
  }
}

validateEnvironment();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Connect to Database
connectDB();

// Initialize 24-hour TTL Ghost Slot Janitor
initCleanupCron();

// ===================================================
// 2. Security Headers & CORS Configuration
// ===================================================
app.use(helmet({
  contentSecurityPolicy: false, // Allows React assets & Google Fonts to load smoothly
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Dynamic CORS configuration (supporting multiple origins, Render preview URLs, & localhost)
const parseAllowedOrigins = () => {
  const origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:5000'
  ];

  if (process.env.CLIENT_URL) {
    const customOrigins = process.env.CLIENT_URL.split(',').map((o) => o.trim()).filter(Boolean);
    origins.push(...customOrigins);
  }

  return [...new Set(origins)];
};

const allowedOrigins = parseAllowedOrigins();

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server, curl, Postman, or health-check probes with no origin
    if (!origin) return callback(null, true);

    // In non-production, allow localhost and loopbacks freely
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }

    // Match exact origin or wildcard
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Support onrender.com subdomains if CLIENT_URL targets Render
    if (origin.endsWith('.onrender.com') && process.env.CLIENT_URL?.includes('.onrender.com')) {
      return callback(null, true);
    }

    return callback(new Error(`Blocked by CORS policy for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsing & Input Sanitization
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(mongoSanitizeMiddleware);

// ===================================================
// 3. Health Check Routes (Dedicated Root & /api/health)
// ===================================================
const clientDistPath = path.join(__dirname, '../client/dist');

// Root Health Check Route
app.get('/', (req, res, next) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  // If static React build exists and client accepts HTML, serve the frontend
  if (fs.existsSync(indexPath) && req.accepts('html')) {
    return res.sendFile(indexPath);
  }

  res.status(200).json({
    status: 'ok',
    message: 'API Server is live',
    service: 'Rozy Mehtab Guidance & Booking Engine API',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Dedicated API Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API Server is live',
    service: 'Rozy Mehtab Career Guidance & Booking Engine API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// ===================================================
// 4. API Endpoints
// ===================================================
app.use('/api', bookingRoutes);

// ===================================================
// 5. Static Assets & Client SPA Catch-All
// ===================================================
app.use(express.static(clientDistPath));

// SPA Catch-All: Serve index.html for any client route not handled by /api
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// ===================================================
// 6. 404 & Global Error Handling
// ===================================================
// Unhandled API Route 404
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Requested API endpoint not found.' });
});

// General 404 fallback (when client build is not being served)
app.use((req, res) => {
  res.status(404).json({ error: 'Resource not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ===================================================
// 7. Server Listener (Binds to 0.0.0.0 and dynamic PORT)
// ===================================================
app.listen(PORT, HOST, () => {
  const isServingClient = fs.existsSync(path.join(clientDistPath, 'index.html'));
  console.log(`🚀 Career Guidance API server active on http://${HOST}:${PORT}`);
  console.log(`🔒 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Serving Client Build: ${isServingClient ? 'YES (' + clientDistPath + ')' : 'NO (API-only mode)'}`);
});
