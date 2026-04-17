import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const {
    GOOGLE_USER_EMAIL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN
  } = process.env;

  if (!GOOGLE_USER_EMAIL || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    throw new Error("Email service is not configured");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: GOOGLE_USER_EMAIL,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      refreshToken: GOOGLE_REFRESH_TOKEN
    }
  });

  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  if (!to || !subject || (!html && !text)) {
    throw new Error("Email data is incomplete");
  }

  const details = await getTransporter().sendMail({
    from: process.env.GOOGLE_USER_EMAIL,
    to,
    subject,
    html,
    text
  });

  console.log("Email sent:", details.messageId);
  return details;
}

export async function sendVerificationEmail({ to, name, verificationUrl }) {
  if (!verificationUrl) {
    throw new Error("Verification URL is required");
  }

  return sendEmail({
    to,
    subject: "Verify your Notes Vyapar account",
    html: `
      <p>Hi ${name},</p>
      <p>Thank you for registering at <strong>Notes Vyapar</strong>.</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>If you did not create an account, please ignore this email.</p>
      <p>Best regards,<br />The Notes Vyapar Team</p>
    `,
    text: `Hi ${name}, verify your email by visiting: ${verificationUrl}`
  });
}
