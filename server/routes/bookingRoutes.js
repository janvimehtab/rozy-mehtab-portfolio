const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const {
  bookingRateLimiter,
  slotsRateLimiter,
  sanitizeInputStrings
} = require('../middleware/securityMiddleware');

// Public endpoints
router.get('/available-slots', slotsRateLimiter, bookingController.getAvailableSlots);
router.post('/bookings', bookingRateLimiter, sanitizeInputStrings, bookingController.createBooking);

// Single-use token action endpoints (accessed via email links)
router.get('/bookings/approve', bookingController.approveBooking);
router.get('/bookings/decline', bookingController.declineBooking);

module.exports = router;
