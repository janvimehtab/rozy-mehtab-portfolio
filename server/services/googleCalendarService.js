const { google } = require('googleapis');

/**
 * Handle raw private key string escaping edge cases:
 * Handles raw multi-line strings, JSON-escaped string formats (\n), and surrounding quotes.
 */
function sanitizePrivateKey(rawKey) {
  if (!rawKey) return null;
  let key = rawKey.trim();

  // Strip wrapping quotes if user pasted with quotes in .env or Render dashboard
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // Gracefully replace literal escaped \n with true newline characters
  key = key.replace(/\\n/g, '\n');

  return key.trim();
}

function generateFallbackMeetLink(id) {
  const part1 = Math.random().toString(36).substring(2, 5);
  const part2 = Math.random().toString(36).substring(2, 6);
  const part3 = Math.random().toString(36).substring(2, 5);
  return `https://meet.google.com/${part1}-${part2}-${part3}`;
}

class GoogleCalendarService {
  constructor() {
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    this.serviceAccountEmail = (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').trim();
    this.privateKey = sanitizePrivateKey(process.env.GOOGLE_PRIVATE_KEY);

    this.calendar = null;
    this.isConfigured = Boolean(this.serviceAccountEmail && this.privateKey);

    if (this.isConfigured) {
      try {
        const auth = new google.auth.JWT(
          this.serviceAccountEmail,
          null,
          this.privateKey,
          ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events']
        );
        this.calendar = google.calendar({ version: 'v3', auth });
        console.log('✅ Google Calendar API client initialized with Service Account.');
      } catch (err) {
        console.warn(`⚠️ Google Calendar Service Account initialization failed: ${err.message}. Falling back to simulation mode.`);
        this.isConfigured = false;
        this.calendar = null;
      }
    } else {
      console.log('ℹ️ Google Calendar credentials not provided or incomplete. Running in resilient simulation mode.');
    }
  }

  /**
   * Check if a time slot is busy on the host calendar
   * @param {Date} startDateTime 
   * @param {Date} endDateTime 
   * @returns {Promise<{ isBusy: boolean, busyIntervals: Array }>}
   */
  async checkAvailability(startDateTime, endDateTime) {
    if (!this.isConfigured || !this.calendar) {
      // In simulation mode, no external calendar conflicts
      return { isBusy: false, busyIntervals: [], isMock: true };
    }

    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: new Date(startDateTime).toISOString(),
          timeMax: new Date(endDateTime).toISOString(),
          items: [{ id: this.calendarId }]
        }
      });

      const busySlots = response.data?.calendars?.[this.calendarId]?.busy || [];
      return {
        isBusy: busySlots.length > 0,
        busyIntervals: busySlots,
        isMock: false
      };
    } catch (error) {
      console.warn(`⚠️ Google Calendar FreeBusy query error: ${error.message}. Continuing with local DB availability.`);
      // Fail safely so external API rate limits or outages do not block student bookings
      return { isBusy: false, busyIntervals: [], error: error.message, isMock: true };
    }
  }

  /**
   * Check whether a specific slot has conflict
   */
  async hasConflict(startDateTime, endDateTime) {
    const { isBusy } = await this.checkAvailability(startDateTime, endDateTime);
    return isBusy;
  }

  /**
   * Create Google Calendar Event with Google Meet conference
   * @param {Object} bookingData 
   * @returns {Promise<{ eventId: string, meetLink: string }>}
   */
  async createEvent(bookingData) {
    const fallbackMeetLink = generateFallbackMeetLink(bookingData._id);

    if (!this.isConfigured || !this.calendar) {
      const mockEventId = `sim_gcal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      console.log(`ℹ️ [Google Calendar Sim] Created event ${mockEventId} with Meet: ${fallbackMeetLink}`);
      return { eventId: mockEventId, meetLink: fallbackMeetLink, isMock: true };
    }

    try {
      const hostEmail = process.env.HOST_EMAIL || 'rozymehtab@gmail.com';
      const eventPayload = {
        summary: `🎓 Career Guidance: ${bookingData.studentName} with Rozy Mehtab`,
        description: `1-on-1 Student Career Guidance Session\n\n` +
          `• Student Name: ${bookingData.studentName}\n` +
          `• College: ${bookingData.collegeName}\n` +
          `• University: ${bookingData.universityName}\n` +
          `• Contact Email: ${bookingData.studentEmail}\n` +
          `• Phone / WhatsApp: ${bookingData.studentPhone || 'N/A'}\n` +
          `• Guidance Topic: ${bookingData.purpose}\n` +
          `• Student Notes: ${bookingData.shortDescription || 'None'}\n\n` +
          `Hosted by Rozy Mehtab (College Admin, PMN College Rajpura)`,
        start: {
          dateTime: new Date(bookingData.slotStart).toISOString(),
          timeZone: 'Asia/Kolkata'
        },
        end: {
          dateTime: new Date(bookingData.slotEnd).toISOString(),
          timeZone: 'Asia/Kolkata'
        },
        attendees: [
          { email: bookingData.studentEmail, displayName: bookingData.studentName },
          { email: hostEmail, displayName: 'Rozy Mehtab' }
        ],
        conferenceData: {
          createRequest: {
            requestId: `rozy-meet-${bookingData._id || Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 15 }
          ]
        }
      };

      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: eventPayload,
        conferenceDataVersion: 1
      });

      const event = response.data;
      const meetLink = event.hangoutLink ||
                       event.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri ||
                       fallbackMeetLink;

      console.log(`✅ Google Calendar event created: ${event.id} (Meet: ${meetLink})`);
      return {
        eventId: event.id,
        meetLink,
        isMock: false
      };
    } catch (error) {
      console.warn(`⚠️ Google Calendar API event creation failed: ${error.message}`);
      console.warn('ℹ️ Falling back to generated Google Meet URL to prevent transaction failure.');
      return {
        eventId: `manual_${Date.now()}`,
        meetLink: fallbackMeetLink,
        isFallback: true,
        error: error.message
      };
    }
  }
}

module.exports = new GoogleCalendarService();
