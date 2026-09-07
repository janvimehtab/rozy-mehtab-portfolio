const { google } = require('googleapis');

class GoogleCalendarService {
  constructor() {
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    this.serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    this.privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : null;

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
        console.error('⚠️ Google Calendar init error:', err.message);
        this.isConfigured = false;
      }
    } else {
      console.log('ℹ️ Google Calendar credentials not provided. Running in resilient simulation mode.');
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
          timeMin: startDateTime.toISOString(),
          timeMax: endDateTime.toISOString(),
          items: [{ id: this.calendarId }]
        }
      });

      const busySlots = response.data.calendars[this.calendarId]?.busy || [];
      return {
        isBusy: busySlots.length > 0,
        busyIntervals: busySlots,
        isMock: false
      };
    } catch (error) {
      console.error('Google Calendar FreeBusy query error:', error.message);
      // Fail safely to not block bookings if API is temporarily unreachable
      return { isBusy: false, busyIntervals: [], error: error.message };
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
    if (!this.isConfigured || !this.calendar) {
      // Generate a structured mock Google Meet link
      const randomCode = Math.random().toString(36).substring(2, 5) + '-' +
                         Math.random().toString(36).substring(2, 6) + '-' +
                         Math.random().toString(36).substring(2, 5);
      const mockMeetLink = `https://meet.google.com/${randomCode}`;
      const mockEventId = `sim_gcal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      console.log(`[Google Calendar Sim] Created event ${mockEventId} with Meet: ${mockMeetLink}`);
      return { eventId: mockEventId, meetLink: mockMeetLink, isMock: true };
    }

    try {
      const hostEmail = process.env.HOST_EMAIL || 'rozymehtabofficial@gmail.com';
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
          dateTime: bookingData.slotStart.toISOString(),
          timeZone: 'Asia/Kolkata'
        },
        end: {
          dateTime: bookingData.slotEnd.toISOString(),
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
                       'https://meet.google.com/new';

      return {
        eventId: event.id,
        meetLink
      };
    } catch (error) {
      console.error('Google Calendar event creation error:', error.message);
      // Fallback to generic meet URL so booking can still be confirmed
      const fallbackMeetLink = `https://meet.google.com/rozy-session-${Date.now().toString(36)}`;
      return {
        eventId: `manual_${Date.now()}`,
        meetLink: fallbackMeetLink,
        error: error.message
      };
    }
  }
}

module.exports = new GoogleCalendarService();
