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
// Process-Level Safety Hooks (Crash Prevention on Render)
// ===================================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

// ===================================================
// 1. Startup Environment Validation
// ===================================================
function validateEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  const missingCritical = [];

  // 1. MONGODB_URI verification
  if (!process.env.MONGODB_URI) {
    if (isProduction) {
      missingCritical.push('MONGODB_URI');
    } else {
      console.warn('⚠️ Warning: MONGODB_URI not provided. Server will run in in-memory simulation mode for local testing.');
    }
  } else {
    const uri = process.env.MONGODB_URI.trim();
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      console.error('❌ FATAL CONFIG ERROR: MONGODB_URI must start with "mongodb://" or "mongodb+srv://".');
      if (isProduction) process.exit(1);
    }
    console.log('🔍 Verified MONGODB_URI presence in environment configuration.');
  }

  if (isProduction) {
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
  // 3. Resend Email Service Verification
  if (process.env.RESEND_API_KEY) {
    console.log('✉️ Resend Email Service initialized.');
  } else {
    console.warn('⚠️ Warning: RESEND_API_KEY not provided. Transactional emails will run in simulated preview mode.');
  }
}

validateEnvironment();

const app = express();

// Enable reverse proxy support for Render, Cloudflare, etc.
// Required for express-rate-limit to resolve accurate client IPs without ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Connect to Database
connectDB();

// Initialize 24-hour TTL Ghost Slot Janitor
initCleanupCron();

// ===================================================
// 2. Security Headers & CORS Configuration
// ===================================================
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows React assets & Google Fonts to load smoothly
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

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

app.use(
  cors({
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
      if (origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }

      return callback(new Error(`Blocked by CORS policy for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body Parsing & Input Sanitization
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(mongoSanitizeMiddleware);

// ===================================================
// 3. API Endpoints & Dedicated API Health Route
// ===================================================

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

// API Routes
app.use('/api', bookingRoutes);

// Unhandled API Route 404
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'Requested API endpoint not found.' });
});

// ===================================================
// 4. Static Assets & Client SPA Fallback
// ===================================================
const clientDistPath = path.join(__dirname, '../client/dist');

// Serve static frontend build files
app.use(express.static(clientDistPath));

// Catch-All SPA Handler for React
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  // Fallback API message only if React dist build is missing
  res.status(200).json({
    status: 'ok',
    message: 'API Server is live (Client build not found)',
    service: 'Rozy Mehtab Guidance & Booking Engine API',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// ===================================================
// 5. Global Error Handling
// ===================================================
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Server Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Internal server error')
  });
});

// ===================================================
// 6. Server Listener
// ===================================================
app.listen(PORT, HOST, () => {
  const isServingClient = fs.existsSync(path.join(clientDistPath, 'index.html'));
  console.log(`🚀 Career Guidance API server active on http://${HOST}:${PORT}`);
  console.log(`🔒 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Serving Client Build: ${isServingClient ? 'YES (' + clientDistPath + ')' : 'NO (API-only mode)'}`);
});