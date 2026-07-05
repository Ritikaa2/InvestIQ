const nodemailer = require('nodemailer');
require('dotenv').config();

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  GMAIL_USER,
  GMAIL_APP_PASSWORD
} = process.env;

function createTransporter() {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
  }

  if (GMAIL_USER && GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD }
    });
  }

  return null;
}

async function sendPasswordResetOtp({ to, username, otp, expiresMinutes }) {
  const transporter = createTransporter();
  const from = EMAIL_FROM || GMAIL_USER || SMTP_USER || 'InvestIQ <no-reply@investiq.local>';
  const displayName = username || 'InvestIQ user';
  const subject = 'Your InvestIQ password reset OTP';
  const text = [
    `Hi ${displayName},`,
    '',
    `Your InvestIQ password reset OTP is ${otp}.`,
    `This code expires in ${expiresMinutes} minutes.`,
    '',
    'If you did not request this, you can ignore this email.'
  ].join('\n');
  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
      <h2 style="margin:0 0 12px">InvestIQ password reset</h2>
      <p>Hi ${displayName},</p>
      <p>Use this one-time password to reset your InvestIQ account password:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${otp}</p>
      <p>This code expires in ${expiresMinutes} minutes.</p>
      <p style="color:#64748b;font-size:13px">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  if (!transporter) {
    console.warn(`Email credentials are not configured. Password reset OTP for ${to}: ${otp}`);
    return { sent: false };
  }

  await transporter.sendMail({ from, to, subject, text, html });
  return { sent: true };
}

module.exports = { sendPasswordResetOtp };
