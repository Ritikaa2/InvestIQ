const nodemailer = require("nodemailer");
require("dotenv").config();

const {
  GMAIL_USER,
  GMAIL_APP_PASSWORD,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
} = process.env;

function getSmtpConfig() {
  const authUser = SMTP_USER || GMAIL_USER;
  const authPass = SMTP_PASS || GMAIL_APP_PASSWORD;
  const host = SMTP_HOST || (GMAIL_USER ? "smtp.gmail.com" : "");
  const port = Number(SMTP_PORT) || (host === "smtp.gmail.com" ? 465 : 587);
  const secure = SMTP_SECURE ? SMTP_SECURE === "true" : port === 465;

  return { authUser, authPass, host, port, secure };
}

function createTransporter() {
  const { authUser, authPass, host, port, secure } = getSmtpConfig();

  if (!host || !authUser || !authPass) {
    throw new Error("SMTP credentials are missing in .env");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: authUser,
      pass: authPass,
    },
  });
}

async function sendPasswordResetOtp({
  to,
  username,
  otp,
  expiresMinutes,
}) {
  try {
    const transporter = createTransporter();
    const { authUser } = getSmtpConfig();

    await transporter.verify();

    const mailOptions = {
      from: EMAIL_FROM || `"InvestIQ" <${authUser}>`,
      to,
      subject: "InvestIQ Password Reset OTP",

      text: `
Hello ${username || "User"},

Your password reset OTP is:

${otp}

This OTP expires in ${expiresMinutes} minutes.

If you did not request this password reset, simply ignore this email.

Thanks,
InvestIQ Team
      `,

      html: `
      <div style="font-family:Arial,sans-serif;padding:30px;background:#f5f5f5">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px">

          <h2 style="color:#2563eb">
            InvestIQ Password Reset
          </h2>

          <p>Hello <b>${username || "User"}</b>,</p>

          <p>Use the OTP below to reset your password.</p>

          <div style="
              text-align:center;
              font-size:34px;
              font-weight:bold;
              letter-spacing:8px;
              color:#2563eb;
              margin:25px 0;">
              ${otp}
          </div>

          <p>
            This OTP will expire in
            <b>${expiresMinutes} minutes</b>.
          </p>

          <p style="color:#666">
            If you didn't request this password reset,
            you can safely ignore this email.
          </p>

          <hr>

          <p style="font-size:12px;color:#999">
            InvestIQ
          </p>

        </div>
      </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email Sent:", info.messageId);

    return {
      sent: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("SMTP Error:", error.message);

    return {
      sent: false,
      error: error.message,
    };
  }
}

module.exports = {
  sendPasswordResetOtp,
};

