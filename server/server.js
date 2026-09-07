require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { mongoSanitizeMiddleware } = require('./middleware/securityMiddleware');
const { initCleanupCron } = require('./services/cleanupService');

const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect to Database
connectDB();

// Initialize 24-hour TTL Ghost Slot Janitor
initCleanupCron();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS setup supporting credentials (cookies)
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsing & Sanitization
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(mongoSanitizeMiddleware);

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: "Rozy Mehtab Career Guidance & Booking Engine API"
  });
});

// API Routes
app.use('/api', bookingRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Requested API endpoint not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Career Guidance API server active on http://localhost:${PORT}`);
  console.log(`🔒 Student PII Protection & Single-Use HMAC-SHA256 tokens enabled.`);
  console.log(`📅 Guidance Hours: Monday to Saturday, 5:00 PM – 7:00 PM IST (20-min slots).`);
});
