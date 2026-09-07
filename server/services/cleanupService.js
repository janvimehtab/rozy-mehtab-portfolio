const cron = require('node-cron');
const Booking = require('../models/Booking');

/**
 * Sweeper function to mark unconfirmed bookings older than 24 hours as EXPIRED
 * Releasing the slot back to the public pool
 */
async function cleanExpiredPendingBookings() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await Booking.updateMany(
      {
        status: 'PENDING',
        createdAt: { $lt: twentyFourHoursAgo }
      },
      {
        $set: { status: 'EXPIRED' }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`🧹 [Ghost Slot Janitor] Cleared ${result.modifiedCount} expired pending booking(s). Slots released back to public.`);
    }
  } catch (error) {
    console.error('Error running ghost pending slot cleanup:', error.message);
  }
}

/**
 * Initialize cron job running every 15 minutes
 */
function initCleanupCron() {
  // Run on startup
  cleanExpiredPendingBookings();

  // Run every 15 minutes: "*/15 * * * *"
  cron.schedule('*/15 * * * *', () => {
    cleanExpiredPendingBookings();
  });
  console.log('⏰ 24-Hour TTL Ghost Slot Janitor initialized (running every 15 mins).');
}

module.exports = {
  cleanExpiredPendingBookings,
  initCleanupCron
};
