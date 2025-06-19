export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, booking } = req.body;
    const bookingDetails = Object.entries(booking)
      .map(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `<tr><td><strong>${formattedKey}:</strong></td><td>${value || 'N/A'}</td></tr>`;
      })
      .join('');

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #2563eb;">New Booking Notification</h2>
        <p>You have received a new booking request:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          ${bookingDetails}
        </table>
        
        <p style="margin-top: 30px;">
          <strong>Action Required:</strong> Please review this booking in your admin dashboard.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>This email was sent automatically from Raslipwani Properties booking system.</p>
        </div>
      </div>
    `;

    // Using Mailtrap SMTP for testing - replace with your actual SMTP credentials
    const transporter = {
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "your-mailtrap-user",
        pass: "your-mailtrap-pass"
      }
    };

    const nodemailer = require('nodemailer');
    const mailTransporter = nodemailer.createTransport(transporter);

    await mailTransporter.sendMail({
      from: '"Raslipwani Properties" <bookings@raslipwani.com>',
      to: to,
      subject: subject,
      html: emailBody
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}