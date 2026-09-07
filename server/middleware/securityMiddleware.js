const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Rate limiter for booking creation to prevent spam/denial of service
const bookingRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 booking requests per IP per 15 minutes
  message: {
    error: 'Too many booking attempts from this IP address. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for slot checking API
const slotsRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Custom lightweight XSS and string sanitizer for student PII
 */
function sanitizeInputStrings(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Strip out HTML tags and script injections
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]+>/g, '')
          .trim();
      }
    }
  }
  next();
}

/**
 * Generate cryptographic single-use HMAC-SHA256 Action Token for email approval/declination
 */
function generateActionToken(bookingId, action) {
  const secret = process.env.ACTION_TOKEN_SECRET || 'rozy_mehtab_secret_salt_2026';
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = `${bookingId}:${action}:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Format: base64(payload).signature
  const token = `${Buffer.from(payload).toString('base64url')}.${signature}`;
  return { token, expiresAt: new Date(expiresAt) };
}

/**
 * Verify cryptographic single-use HMAC-SHA256 Action Token
 */
function verifyActionToken(token, expectedAction) {
  try {
    const secret = process.env.ACTION_TOKEN_SECRET || 'rozy_mehtab_secret_salt_2026';
    const [encodedPayload, receivedSignature] = token.split('.');
    if (!encodedPayload || !receivedSignature) {
      return { isValid: false, reason: 'Malformed token structure.' };
    }

    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const [bookingId, action, expiresAtStr] = payload.split(':');

    if (expectedAction && action !== expectedAction) {
      return { isValid: false, reason: 'Invalid token action.' };
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) {
      return { isValid: false, reason: 'Action token has expired (24-hour limit).' };
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isValidSignature) {
      return { isValid: false, reason: 'Invalid cryptographic signature.' };
    }

    return { isValid: true, bookingId, action, expiresAt: new Date(expiresAt) };
  } catch (error) {
    return { isValid: false, reason: error.message };
  }
}

module.exports = {
  mongoSanitizeMiddleware: mongoSanitize(),
  sanitizeInputStrings,
  bookingRateLimiter,
  slotsRateLimiter,
  generateActionToken,
  verifyActionToken
};
