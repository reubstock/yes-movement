const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send a join request email to a group organizer.
 */
async function sendJoinRequest({ groupName, groupLocation, organizerEmail, requesterName, requesterEmail }) {
  await transporter.sendMail({
    from: `"YES Movement" <${process.env.GMAIL_USER}>`,
    to: organizerEmail,
    subject: `New Join Request — ${groupName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222;">
        <h2 style="color:#dc2626;">New Join Request</h2>
        <p>Someone wants to join your YES Movement group.</p>
        <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
          <tr><td style="padding:0.5rem 0;color:#555;width:120px;">Group</td><td style="padding:0.5rem 0;font-weight:bold;">${groupName}</td></tr>
          <tr><td style="padding:0.5rem 0;color:#555;">Location</td><td style="padding:0.5rem 0;">${groupLocation}</td></tr>
          <tr><td style="padding:0.5rem 0;color:#555;">From</td><td style="padding:0.5rem 0;font-weight:bold;">${requesterName}</td></tr>
          <tr><td style="padding:0.5rem 0;color:#555;">Email</td><td style="padding:0.5rem 0;"><a href="mailto:${requesterEmail}">${requesterEmail}</a></td></tr>
        </table>
        <p style="margin-top:1.5rem;">Reply directly to this email or reach out to <a href="mailto:${requesterEmail}">${requesterName}</a> to welcome them in.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:2rem 0;" />
        <p style="font-size:0.8rem;color:#aaa;">YES Movement · Say yes to what matters.</p>
      </div>
    `,
    replyTo: requesterEmail,
  });
}

/**
 * Send an RSVP notification email to a summit host.
 */
async function sendSummitRSVP({ summitTitle, summitDate, summitLocation, hostEmail, requesterName, requesterEmail, message }) {
  await transporter.sendMail({
    from: `"YES Movement" <${process.env.GMAIL_USER}>`,
    to: hostEmail,
    subject: `New RSVP — ${summitTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222;">
        <h2 style="color:#f5c518;">New Summit RSVP</h2>
        <p>Someone wants to attend your YES Movement summit.</p>
        <table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
          <tr><td style="padding:0.5rem 0;color:#555;width:120px;">Summit</td><td style="padding:0.5rem 0;font-weight:bold;">${summitTitle}</td></tr>
          <tr><td style="padding:0.5rem 0;color:#555;">Date</td><td style="padding:0.5rem 0;">${summitDate}</td></tr>
          <tr><td style="padding:0.5rem 0;color:#555;">Location</td><td style="padding:0.5rem 0;">${summitLocation}</td></tr>
          <tr><td style="padding:0.5rem 0;color:#555;">From</td><td style="padding:0.5rem 0;font-weight:bold;">${requesterName}</td></tr>
          <tr><td style="padding:0.5rem 0;color:#555;">Email</td><td style="padding:0.5rem 0;"><a href="mailto:${requesterEmail}">${requesterEmail}</a></td></tr>
          ${message ? `<tr><td style="padding:0.5rem 0;color:#555;vertical-align:top;">Message</td><td style="padding:0.5rem 0;">${message}</td></tr>` : ''}
        </table>
        <p style="margin-top:1.5rem;">Reply directly to this email or reach out to <a href="mailto:${requesterEmail}">${requesterName}</a>.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:2rem 0;" />
        <p style="font-size:0.8rem;color:#aaa;">YES Movement · Say yes to what matters.</p>
      </div>
    `,
    replyTo: requesterEmail,
  });
}

module.exports = { sendJoinRequest, sendSummitRSVP };
