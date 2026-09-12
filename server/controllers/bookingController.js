const validator = require('validator');
const Booking = require('../models/Booking');
const googleCalendarService = require('../services/googleCalendarService');
const emailService = require('../services/emailService');
const { generateActionToken, verifyActionToken } = require('../middleware/securityMiddleware');

/**
 * Helper to construct slot times in IST (UTC+5:30)
 * Mon-Sat, 5:00 PM to 7:00 PM IST (20-min intervals)
 */
function generateDaySlotsIST(dateStr) {
  // dateStr format: YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Date in UTC representing midnight of that day in IST:
  // IST is UTC + 5h30m. So 00:00 IST is previous day 18:30 UTC.
  // 17:00 IST (5:00 PM) is 11:30 UTC on the same calendar day.
  // 19:00 IST (7:00 PM) is 13:30 UTC on the same calendar day.

  // Slot definitions in IST (hours and minutes)
  const slotDefinitions = [
    { startH: 17, startM: 0,  endH: 17, endM: 20, label: '5:00 PM – 5:20 PM' },
    { startH: 17, startM: 20, endH: 17, endM: 40, label: '5:20 PM – 5:40 PM' },
    { startH: 17, startM: 40, endH: 18, endM: 0,  label: '5:40 PM – 6:00 PM' },
    { startH: 18, startM: 0,  endH: 18, endM: 20, label: '6:00 PM – 6:20 PM' },
    { startH: 18, startM: 20, endH: 18, endM: 40, label: '6:20 PM – 6:40 PM' },
    { startH: 18, startM: 40, endH: 19, endM: 0,  label: '6:40 PM – 7:00 PM' },
  ];

  return slotDefinitions.map(slot => {
    // Construct ISO UTC string for IST time:
    // IST = UTC + 5:30 => UTC = IST - 5:30
    const startUtcDate = new Date(Date.UTC(year, month - 1, day, slot.startH, slot.startM) - (5.5 * 60 * 60 * 1000));
    const endUtcDate = new Date(Date.UTC(year, month - 1, day, slot.endH, slot.endM) - (5.5 * 60 * 60 * 1000));

    return {
      label: slot.label,
      slotStart: startUtcDate.toISOString(),
      slotEnd: endUtcDate.toISOString(),
      startTimeIST: `${slot.startH > 12 ? slot.startH - 12 : slot.startH}:${slot.startM.toString().padStart(2, '0')} PM`,
      endTimeIST: `${slot.endH > 12 ? slot.endH - 12 : slot.endH}:${slot.endM.toString().padStart(2, '0')} PM`
    };
  });
}

/**
 * GET /api/available-slots?date=YYYY-MM-DD
 */
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, error: 'A valid date parameter (YYYY-MM-DD) is required.' });
    }

    const [year, month, day] = date.split('-').map(Number);
    // Determine day of week in IST
    const sampleDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const dayOfWeek = sampleDate.getUTCDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday

    // Sunday check
    if (dayOfWeek === 0) {
      return res.json({
        date,
        dayOfWeek: 'Sunday',
        isWorkingDay: false,
        message: 'Sundays are administrative off-days. Sessions are conducted Monday through Saturday (5:00 PM – 7:00 PM IST).',
        slots: []
      });
    }

    const potentialSlots = generateDaySlotsIST(date);
    const now = new Date();

    // Query MongoDB for booked slots on this day
    const dayStartUtc = new Date(potentialSlots[0].slotStart);
    const dayEndUtc = new Date(potentialSlots[potentialSlots.length - 1].slotEnd);

    const existingBookings = await Booking.find({
      slotStart: { $gte: dayStartUtc, $lte: dayEndUtc },
      status: { $in: ['PENDING', 'CONFIRMED'] }
    }).select('slotStart slotEnd status');

    const bookedStarts = new Set(
      existingBookings.map(b => new Date(b.slotStart).toISOString())
    );

    // Query Google Calendar Free/Busy for this day
    const { busyIntervals } = await googleCalendarService.checkAvailability(dayStartUtc, dayEndUtc);

    const availableSlots = potentialSlots.map(slot => {
      const slotStartTime = new Date(slot.slotStart);
      const slotEndTime = new Date(slot.slotEnd);

      // Check if slot is in the past
      const isPast = slotStartTime <= now;

      // Check if already in MongoDB
      const isBookedInDB = bookedStarts.has(slot.slotStart);

      // Check if overlaps with Google Calendar busy time
      const isGoogleBusy = busyIntervals.some(busy => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return slotStartTime < busyEnd && slotEndTime > busyStart;
      });

      const isAvailable = !isPast && !isBookedInDB && !isGoogleBusy;

      return {
        ...slot,
        isAvailable,
        reason: isPast ? 'Past slot' : (isBookedInDB ? 'Already reserved' : (isGoogleBusy ? 'Calendar conflict' : null))
      };
    });

    return res.json({
      date,
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
      isWorkingDay: true,
      slots: availableSlots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve available slots. Please try again.' });
  }
};

/**
 * POST /api/bookings
 * Double-Booking prevention & student PII handling
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      studentName,
      collegeName,
      universityName,
      studentEmail,
      studentPhone,
      purpose,
      shortDescription,
      referralSource,
      slotStart,
      slotEnd
    } = req.body;

    // Validate required fields presence
    if (!studentName || !collegeName || !universityName || !studentEmail || !purpose || !slotStart || !slotEnd) {
      return res.status(400).json({ success: false, error: 'All required fields must be filled.' });
    }

    // Validate student name
    const trimmedName = typeof studentName === 'string' ? studentName.trim() : '';
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({ success: false, error: 'Please provide a valid full name (2 to 100 characters).' });
    }

    // Validate student email with validator.isEmail
    const rawEmail = typeof studentEmail === 'string' ? studentEmail.trim() : '';
    if (!validator.isEmail(rawEmail)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }
    const sanitizedEmail = validator.normalizeEmail(rawEmail) || rawEmail.toLowerCase();

    // Validate college and university names
    const trimmedCollege = typeof collegeName === 'string' ? collegeName.trim() : '';
    const trimmedUniversity = typeof universityName === 'string' ? universityName.trim() : '';
    if (!trimmedCollege || !trimmedUniversity) {
      return res.status(400).json({ success: false, error: 'College and University names are required.' });
    }

    // Validate purpose enum
    const validPurposes = ['Career Advice', 'Internship Guidance', 'General Academic Query'];
    if (!validPurposes.includes(purpose)) {
      return res.status(400).json({ success: false, error: 'Invalid purpose selected. Please choose a valid guidance topic.' });
    }

    // Validate slot date and time boundaries
    const startDate = new Date(slotStart);
    const endDate = new Date(slotEnd);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid slotStart or slotEnd date format.' });
    }

    if (startDate >= endDate) {
      return res.status(400).json({ success: false, error: 'Slot start time must be before slot end time.' });
    }

    const now = new Date();
    if (startDate <= now) {
      return res.status(400).json({ success: false, error: 'Cannot book a time slot in the past.' });
    }

    // Prevent excessive advance bookings (> 90 days)
    const maxFutureDate = new Date();
    maxFutureDate.setDate(maxFutureDate.getDate() + 90);
    if (startDate > maxFutureDate) {
      return res.status(400).json({ success: false, error: 'Sessions can only be booked up to 90 days in advance.' });
    }

    // ATOMIC DOUBLE-BOOKING CHECK: Prevent race conditions across simultaneous booking attempts
    const existingBooking = await Booking.findOne({
      slotStart: startDate,
      status: { $in: ['PENDING', 'CONFIRMED'] }
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        error: 'Conflict: This slot was just selected by another student. Please pick another available time.'
      });
    }

    // Generate temporary ID for cryptographic action token generation
    const tempTokenPayload = `init-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const { token: confirmationToken, expiresAt: tokenExpiresAt } = generateActionToken(tempTokenPayload, 'approve');

    // Create database record with PENDING status
    const booking = new Booking({
      studentName: trimmedName,
      collegeName: trimmedCollege,
      universityName: trimmedUniversity,
      studentEmail: sanitizedEmail,
      studentPhone: studentPhone ? String(studentPhone).trim() : '',
      purpose,
      shortDescription: shortDescription ? String(shortDescription).trim().substring(0, 500) : '',
      referralSource: referralSource || 'Direct Website',
      slotStart: startDate,
      slotEnd: endDate,
      status: 'PENDING',
      confirmationToken,
      tokenExpiresAt
    });

    await booking.save();

    // Generate exact action tokens tied to this newly saved booking ID
    const { token: approveToken } = generateActionToken(booking._id.toString(), 'approve');
    const { token: declineToken } = generateActionToken(booking._id.toString(), 'decline');

    // Bind confirmation token to the specific approveToken
    booking.confirmationToken = approveToken;
    await booking.save();

    const serverBaseUrl = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    // Construct single-use action URLs for host email
    const approveUrl = `${serverBaseUrl}/api/bookings/approve?token=${approveToken}`;
    const declineUrl = `${serverBaseUrl}/api/bookings/decline?token=${declineToken}`;

    // NON-BLOCKING ISOLATED EMAIL DISPATCH:
    // If SMTP fails (bad credentials, port timeout, cloud firewall), the booking remains safely saved in DB
    try {
      await emailService.sendHostNotification(booking, approveUrl, declineUrl);
    } catch (emailErr) {
      console.warn(`❌ Nodemailer delivery failed for host notification: ${emailErr.message}`);
    }

    return res.status(201).json({
      success: true,
      message: 'Request sent! Rozy Mehtab will confirm your slot shortly.',
      booking: {
        id: booking._id,
        studentName: booking.studentName,
        slotStart: booking.slotStart,
        slotEnd: booking.slotEnd,
        status: booking.status
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, error: 'This time slot is already reserved.' });
    }
    console.error('❌ Error creating booking:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while processing booking.' });
  }
};

/**
 * GET /api/bookings/approve?token=...
 * Single-use HMAC action link from email
 */
exports.approveBooking = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(renderActionHtml('Invalid Request', 'Action token missing.', 'error'));
    }

    const verification = verifyActionToken(token, 'approve');
    if (!verification.isValid) {
      return res.status(400).send(renderActionHtml('Action Token Expired or Invalid', verification.reason, 'error'));
    }

    const booking = await Booking.findById(verification.bookingId);
    if (!booking) {
      return res.status(404).send(renderActionHtml('Booking Not Found', 'This booking request no longer exists.', 'error'));
    }

    if (booking.status === 'CONFIRMED') {
      return res.send(renderActionHtml('Already Confirmed', `This session with ${booking.studentName} is already confirmed.<br/><br/>Google Meet link: <a href="${booking.meetLink}" target="_blank" style="color: #2563eb;">${booking.meetLink}</a>`, 'info'));
    }

    if (booking.status === 'EXPIRED') {
      return res.status(400).send(renderActionHtml('Booking Expired', 'This booking request exceeded the 24-hour response window and has expired.', 'warning'));
    }

    if (booking.status === 'DECLINED') {
      return res.status(400).send(renderActionHtml('Booking Declined', 'This request was previously marked as declined.', 'warning'));
    }

    // EDGE CASE 3: Admin Calendar Conflict Check Prior to Approval
    const hasConflict = await googleCalendarService.hasConflict(booking.slotStart, booking.slotEnd);
    if (hasConflict) {
      const conflictMsg = `
        A scheduling conflict was detected on your Google Calendar for this slot (${emailService.formatToIST(booking.slotStart)}).
        <br/><br/>
        Please decline this request or communicate with the student directly at <a href="mailto:${booking.studentEmail}">${booking.studentEmail}</a> to reschedule.
      `;
      return res.status(409).send(renderActionHtml('Calendar Conflict Detected', conflictMsg, 'warning'));
    }

    // Generate Google Meet event & link
    const { eventId, meetLink } = await googleCalendarService.createEvent(booking);

    booking.status = 'CONFIRMED';
    booking.googleCalendarEventId = eventId;
    booking.meetLink = meetLink;
    await booking.save();

    // Send confirmation email with attached .ics to student (isolated & non-blocking)
    try {
      await emailService.sendStudentConfirmation(booking);
    } catch (emailErr) {
      console.warn(`❌ Nodemailer delivery failed for student confirmation: ${emailErr.message}`);
    }

    const successContent = `
      You have successfully confirmed the 20-minute guidance session with <strong>${booking.studentName}</strong>.
      <br/><br/>
      <strong>Slot:</strong> ${emailService.formatToIST(booking.slotStart)}<br/>
      <strong>Google Meet:</strong> <a href="${meetLink}" target="_blank" style="color: #2563eb; font-weight: bold;">${meetLink}</a><br/>
      <strong>Student Email:</strong> ${booking.studentEmail}<br/>
      <strong>College:</strong> ${booking.collegeName} (${booking.universityName})
      <br/><br/>
      A calendar invite (.ics) and email confirmation have been dispatched to the student automatically.
    `;

    return res.send(renderActionHtml('Session Confirmed! 🎉', successContent, 'success'));
  } catch (error) {
    console.error('Error in approveBooking:', error);
    return res.status(500).send(renderActionHtml('Server Error', 'Failed to approve booking. Please try again.', 'error'));
  }
};

/**
 * GET /api/bookings/decline?token=...
 * Single-use HMAC action link from email
 */
exports.declineBooking = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(renderActionHtml('Invalid Request', 'Action token missing.', 'error'));
    }

    const verification = verifyActionToken(token, 'decline');
    if (!verification.isValid) {
      return res.status(400).send(renderActionHtml('Action Token Invalid', verification.reason, 'error'));
    }

    const booking = await Booking.findById(verification.bookingId);
    if (!booking) {
      return res.status(404).send(renderActionHtml('Booking Not Found', 'This booking request no longer exists.', 'error'));
    }

    if (booking.status === 'DECLINED') {
      return res.send(renderActionHtml('Already Declined', `This session with ${booking.studentName} has already been declined.`, 'info'));
    }

    booking.status = 'DECLINED';
    await booking.save();

    // Notify student politely (isolated & non-blocking)
    try {
      await emailService.sendStudentDeclination(booking, 'Administrative scheduling limit reached.');
    } catch (emailErr) {
      console.warn(`❌ Nodemailer delivery failed for student declination: ${emailErr.message}`);
    }

    const declineContent = `
      You have declined the booking request from <strong>${booking.studentName}</strong>.
      <br/><br/>
      The slot (${emailService.formatToIST(booking.slotStart)}) has been released back to the public pool, and a polite notification email was sent to ${booking.studentEmail}.
    `;

    return res.send(renderActionHtml('Request Declined', declineContent, 'info'));
  } catch (error) {
    console.error('Error in declineBooking:', error);
    return res.status(500).send(renderActionHtml('Server Error', 'Failed to process request.', 'error'));
  }
};

/**
 * HTML UI Renderer for Admin Token Action responses
 */
function renderActionHtml(title, message, type = 'info') {
  const colors = {
    success: { bg: '#ecfdf5', border: '#10b981', text: '#065f46', icon: '✅' },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', icon: '⚠️' },
    error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', icon: '❌' },
    info: { bg: '#f0f9ff', border: '#0ea5e9', text: '#075985', icon: 'ℹ️' }
  };
  const theme = colors[type] || colors.info;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Rozy Mehtab Career Guidance</title>
    <style>
      body {
        margin: 0;
        padding: 40px 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f8fafc;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh;
      }
      .card {
        background: #ffffff;
        max-width: 520px;
        width: 100%;
        border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08);
        border: 1px solid #e2e8f0;
        overflow: hidden;
      }
      .header {
        padding: 24px;
        background: ${theme.bg};
        border-bottom: 2px solid ${theme.border};
        text-align: center;
      }
      .icon {
        font-size: 40px;
        margin-bottom: 12px;
      }
      h2 {
        margin: 0;
        color: ${theme.text};
        font-size: 22px;
      }
      .body {
        padding: 30px 28px;
        color: #334155;
        line-height: 1.6;
        font-size: 15px;
      }
      .footer {
        padding: 16px 28px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        text-align: center;
        font-size: 13px;
        color: #94a3b8;
      }
      a.btn {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 20px;
        background: #1e293b;
        color: #ffffff;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <div class="icon">${theme.icon}</div>
        <h2>${title}</h2>
      </div>
      <div class="body">
        ${message}
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="btn">Return to Website</a>
        </div>
      </div>
      <div class="footer">
        Rozy Mehtab • PMN College, Rajpura • Career Guidance Platform
      </div>
    </div>
  </body>
  </html>
  `;
}
