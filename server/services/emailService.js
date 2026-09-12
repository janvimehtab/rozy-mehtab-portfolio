const nodemailer = require('nodemailer');
const ical = require('ical-generator').default;

function cleanAppPassword(pass) {
  if (!pass) return '';
  // Automatically strip whitespace and newlines from Google App Passwords
  return pass.replace(/\s+/g, '').trim();
}

class EmailService {
  constructor() {
    this.transporter = null;
    this.fromEmail = process.env.EMAIL_FROM || '"Rozy Mehtab - Career Guidance" <rozymehtab@gmail.com>';
    this.initTransporter();
  }

  async initTransporter() {
    const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log(`✅ Nodemailer SSL transport configured: smtp.gmail.com:465 (secure: true, user: ${smtpUser})`);

      // Connection Verification Hook on application boot
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Nodemailer SMTP Connection Verification Failed:');
          console.error(`   Error Message: ${error.message}`);
          console.error(`   Target Host: smtp.gmail.com:465 (Secure: true)`);
          console.error(`   User Account: ${smtpUser}`);
          console.error('   👉 Tip: Double check your SMTP_USER and 16-character Google App Password in Render.');
        } else {
          console.log(`✅ SMTP connection verified successfully on smtp.gmail.com:465. Outbound mail engine is ready.`);
        }
      });
    } else {
      console.log('ℹ️ SMTP credentials not fully provided. Generating preview ethereal/console logger.');
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        console.log(`✅ Ethereal test mailer ready for mock emails (${testAccount.user})`);
      } catch (err) {
        this.transporter = null;
        console.log('⚠️ Running email service in local terminal preview mode.');
      }
    }
  }

  /**
   * Helper to format UTC Date into human-readable IST string
   */
  formatToIST(date) {
    return new Date(date).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' IST';
  }

  /**
   * Send notification to host (Rozy Mehtab) with HMAC tokenized action URLs
   */
  async sendHostNotification(booking, approveUrl, declineUrl) {
    const timeFormatted = `${this.formatToIST(booking.slotStart)} - ${new Date(booking.slotEnd).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })} IST`;
    const hostEmail = process.env.HOST_EMAIL || 'rozymehtab@gmail.com';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #be123c 0%, #881337 100%); color: #ffffff; padding: 24px; text-align: left; }
        .header h2 { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; }
        .header p { margin: 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 24px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .info-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .label { color: #64748b; font-weight: 600; width: 35%; }
        .value { color: #0f172a; font-weight: 500; }
        .highlight-box { background: #fff1f2; border-left: 4px solid #e11d48; padding: 14px; border-radius: 6px; margin-bottom: 24px; }
        .actions { display: flex; gap: 12px; margin-top: 24px; }
        .btn { display: inline-block; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; text-align: center; }
        .btn-approve { background-color: #059669; color: #ffffff !important; }
        .btn-decline { background-color: #e11d48; color: #ffffff !important; }
        .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2>New Student Guidance Request</h2>
          <p>A new 20-minute session request is awaiting your confirmation</p>
        </div>
        <div class="content">
          <div class="highlight-box">
            <strong style="color: #9f1239;">🗓 Requested Slot:</strong><br/>
            <span style="font-size: 16px; font-weight: 700; color: #1e1b24;">${timeFormatted}</span>
          </div>

          <table class="info-table">
            <tr>
              <td class="label">Student Name:</td>
              <td class="value">${booking.studentName}</td>
            </tr>
            <tr>
              <td class="label">Email:</td>
              <td class="value"><a href="mailto:${booking.studentEmail}" style="color: #e11d48;">${booking.studentEmail}</a></td>
            </tr>
            <tr>
              <td class="label">Phone / WhatsApp:</td>
              <td class="value">${booking.studentPhone || 'Not provided'}</td>
            </tr>
            <tr>
              <td class="label">College:</td>
              <td class="value">${booking.collegeName}</td>
            </tr>
            <tr>
              <td class="label">University:</td>
              <td class="value">${booking.universityName}</td>
            </tr>
            <tr>
              <td class="label">Topic / Purpose:</td>
              <td class="value"><strong>${booking.purpose}</strong></td>
            </tr>
            <tr>
              <td class="label">Student Notes:</td>
              <td class="value">${booking.shortDescription || 'No additional note'}</td>
            </tr>
            <tr>
              <td class="label">Referral:</td>
              <td class="value">${booking.referralSource}</td>
            </tr>
          </table>

          <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
            ⚠️ <em>These single-use action buttons expire in 24 hours. Clicking Approve will generate the Google Meet event and notify the student automatically.</em>
          </p>

          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <a href="${approveUrl}" class="btn btn-approve" style="margin-right: 12px;">✅ Approve Booking</a>
                <a href="${declineUrl}" class="btn btn-decline">❌ Decline</a>
              </td>
            </tr>
          </table>
        </div>
        <div class="footer">
          Rozy Mehtab • College Admin, PMN College Rajpura • Career Guidance Engine
        </div>
      </div>
    </body>
    </html>
    `;

    console.log(`\n================== HOST ACTION EMAIL ==================`);
    console.log(`To: ${hostEmail}`);
    console.log(`Subject: [Action Required] New Guidance Request: ${booking.studentName}`);
    console.log(`Approve Link: ${approveUrl}`);
    console.log(`Decline Link: ${declineUrl}`);
    console.log(`=======================================================\n`);

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: this.fromEmail,
          to: hostEmail,
          subject: `[Action Required] New Guidance Request from ${booking.studentName} (${booking.purpose})`,
          html
        });
        if (nodemailer.getTestMessageUrl(info)) {
          console.log(`✉️ Preview Host Email in browser: ${nodemailer.getTestMessageUrl(info)}`);
        }
        return { success: true, messageId: info?.messageId };
      } catch (err) {
        console.warn(`❌ Nodemailer delivery failed for host notification: ${err.message}`);
        return { success: false, error: err.message };
      }
    }
    return { success: true, isSimulated: true };
  }

  /**
   * Send confirmation to student with Google Meet link and .ics file
   */
  async sendStudentConfirmation(booking) {
    const timeFormatted = `${this.formatToIST(booking.slotStart)} - ${new Date(booking.slotEnd).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })} IST`;

    // Build iCalendar (.ics) string
    const cal = ical({ name: 'Student Career Guidance - Rozy Mehtab' });
    cal.createEvent({
      id: booking._id ? booking._id.toString() : `booking-${Date.now()}`,
      start: booking.slotStart,
      end: booking.slotEnd,
      summary: `🎓 Career Guidance Session with Rozy Mehtab`,
      description: `1-on-1 Guidance Session with Rozy Mehtab (College Admin, PMN College Rajpura).\n\nTopic: ${booking.purpose}\nGoogle Meet: ${booking.meetLink}\n\nLooking forward to meeting you!`,
      location: booking.meetLink || 'Google Meet',
      url: booking.meetLink,
      organizer: {
        name: 'Rozy Mehtab',
        email: process.env.HOST_EMAIL || 'rozymehtab@gmail.com'
      }
    });

    const icsContent = cal.toString();

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0 0 6px 0; font-size: 24px; font-weight: 700; }
        .header p { margin: 0; font-size: 15px; opacity: 0.95; }
        .content { padding: 28px 24px; }
        .highlight-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px; margin-bottom: 24px; text-align: center; }
        .meet-btn { display: inline-block; background: #1a73e8; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 16px 0; box-shadow: 0 2px 4px rgba(26,115,232,0.3); }
        .details-box { background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
        .details-box p { margin: 8px 0; font-size: 14px; }
        .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🎉 Session Confirmed!</h1>
          <p>Your 1-on-1 guidance session with Rozy Mehtab is locked in.</p>
        </div>
        <div class="content">
          <p>Hi <strong>${booking.studentName}</strong>,</p>
          <p>Rozy Mehtab has confirmed your session. Here are your appointment details:</p>

          <div class="highlight-card">
            <div style="font-size: 13px; text-transform: uppercase; color: #166534; font-weight: 700; letter-spacing: 0.5px;">Confirmed Date & Time</div>
            <div style="font-size: 18px; font-weight: 800; color: #14532d; margin-top: 4px;">${timeFormatted}</div>
            
            ${booking.meetLink ? `
              <div style="margin-top: 16px;">
                <a href="${booking.meetLink}" target="_blank" class="meet-btn">📹 Join with Google Meet</a>
                <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Link: <a href="${booking.meetLink}" style="color: #1a73e8;">${booking.meetLink}</a></div>
              </div>
            ` : ''}
          </div>

          <div class="details-box">
            <p><strong>Guidance Topic:</strong> ${booking.purpose}</p>
            <p><strong>College / University:</strong> ${booking.collegeName} (${booking.universityName})</p>
            <p><strong>Session Cost:</strong> 🎓 100% FREE (October 2026 Student Promotion)</p>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            📎 <em>We have attached a calendar invite (<code>invite.ics</code>) to this email. Opening it will automatically add this event to your Google Calendar, Apple Calendar, or Outlook.</em>
          </p>
        </div>
        <div class="footer">
          Rozy Mehtab • College Administrator (PMN College Rajpura) & Digital Mentor<br/>
          Follow on Instagram: <a href="https://instagram.com/rozymehtabofficial" style="color: #e11d48;">@rozymehtabofficial</a>
        </div>
      </div>
    </body>
    </html>
    `;

    console.log(`\n================== STUDENT CONFIRMATION ==================`);
    console.log(`To: ${booking.studentEmail}`);
    console.log(`Subject: Confirmed: Career Guidance Session with Rozy Mehtab`);
    console.log(`Google Meet: ${booking.meetLink}`);
    console.log(`==========================================================\n`);

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: this.fromEmail,
          to: booking.studentEmail,
          subject: `Confirmed: Your Guidance Session with Rozy Mehtab 🎓`,
          html,
          attachments: [
            {
              filename: 'invite.ics',
              content: icsContent,
              contentType: 'text/calendar; charset=utf-8; method=REQUEST'
            }
          ]
        });
        if (nodemailer.getTestMessageUrl(info)) {
          console.log(`✉️ Preview Student Email: ${nodemailer.getTestMessageUrl(info)}`);
        }
        return { success: true, messageId: info?.messageId };
      } catch (err) {
        console.warn(`❌ Nodemailer delivery failed for student confirmation: ${err.message}`);
        return { success: false, error: err.message };
      }
    }
    return { success: true, isSimulated: true };
  }

  /**
   * Send cancellation/declination notice to student
   */
  async sendStudentDeclination(booking, reason = 'Administrative / Scheduling conflict') {
    const timeFormatted = `${this.formatToIST(booking.slotStart)} IST`;
    const html = `
    <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h3 style="color: #be123c;">Guidance Session Update</h3>
      <p>Dear ${booking.studentName},</p>
      <p>Thank you for reaching out for career guidance. Unfortunately, Rozy Mehtab is unable to confirm the requested slot at <strong>${timeFormatted}</strong> due to: <em>${reason}</em>.</p>
      <p>You are warmly welcome to select another available slot during Monday to Saturday (5:00 PM – 7:00 PM IST) at any time.</p>
      <p style="margin-top: 24px;">Warm regards,<br/><strong>Rozy Mehtab</strong><br/>PMN College, Rajpura</p>
    </div>
    `;

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: this.fromEmail,
          to: booking.studentEmail,
          subject: `Update regarding your guidance request with Rozy Mehtab`,
          html
        });
        return { success: true, messageId: info?.messageId };
      } catch (err) {
        console.warn(`❌ Nodemailer delivery failed for student declination: ${err.message}`);
        return { success: false, error: err.message };
      }
    }
    return { success: true, isSimulated: true };
  }
}

module.exports = new EmailService();
