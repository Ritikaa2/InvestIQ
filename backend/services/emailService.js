require("dotenv").config();

const {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
  EMAILJS_PRIVATE_KEY,
} = process.env;

const EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";

function hasEmailJsConfig() {
  return Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
}

async function sendPasswordResetOtp({
  to,
  username,
  otp,
  expiresMinutes,
}) {
  try {
    if (!hasEmailJsConfig()) {
      throw new Error("EmailJS credentials are missing in .env");
    }

    const response = await fetch(EMAILJS_SEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY || undefined,
        template_params: {
          to_email: to,
          to_name: username || "User",
          username: username || "User",
          otp,
          expires_minutes: expiresMinutes,
          app_name: "InvestIQ",
        },
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(responseText || `EmailJS request failed with status ${response.status}`);
    }

    console.log("EmailJS OTP sent:", responseText || response.status);

    return {
      sent: true,
      provider: "emailjs",
      response: responseText,
    };
  } catch (error) {
    console.error("EmailJS Error:", error.message);

    return {
      sent: false,
      error: error.message,
    };
  }
}

module.exports = {
  sendPasswordResetOtp,
};
