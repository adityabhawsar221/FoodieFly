const nodemailer = require("nodemailer");
const dotenv = require("dotenv")
dotenv.config();

const MAIL_FROM = process.env.MAIL_FROM || process.env.EMAIL;

const createTransporter = () => {
  // Prefer explicit SMTP settings when provided (recommended for production)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
    });
  }

  // Gmail fallback for local/dev. Note: some hosts block SMTP ports.
  return nodemailer.createTransport({
    service: "gmail",
    port: Number(process.env.GMAIL_SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
  });
};

const transporter = createTransporter();

const assertMailConfigured = () => {
  const hasFrom = Boolean(MAIL_FROM);
  const hasSmtp = Boolean(process.env.SMTP_HOST);
  const hasGmailCreds = Boolean(process.env.EMAIL && process.env.PASS);

  if (!hasFrom) {
    const err = new Error("Mail sender is not configured (MAIL_FROM/EMAIL missing)");
    err.code = "MAIL_NOT_CONFIGURED";
    throw err;
  }
  if (!hasSmtp && !hasGmailCreds) {
    const err = new Error(
      "Mail transport is not configured (set SMTP_HOST... or EMAIL/PASS for Gmail)"
    );
    err.code = "MAIL_NOT_CONFIGURED";
    throw err;
  }
};

const sendOtpMail = async function (to, otp) {
  assertMailConfigured();
  await transporter.sendMail({
    from: MAIL_FROM, // sender address
    to, // list of recipients
    subject: "Your One-Time Password (OTP) for Account Verification", // subject line
    html: ` <p>Hello,</p>
            <p>Your <strong>One-Time Password (OTP)</strong> is:</p>
            <h2>${otp}</h2>
            <p>This OTP is valid for the next <strong>5 minutes</strong>.</p>
            <p>Please do not share this code with anyone.</p>
            <p>Regards,<br/>Support Team</p>
            `, // HTML body
  })
};

const sendDeliveryOtpMail = async function (user, otp) {
  assertMailConfigured();
  await transporter.sendMail({
    from: MAIL_FROM, // sender address
    to: user.email, // list of recipients
    subject: "Your One-Time Password (OTP) for Delivery Verification", // subject line
    html: ` <p>Hello,</p>
            <p>Your <strong>One-Time Password (OTP)</strong> is:</p>
            <h2>${otp}</h2>
            <p>This OTP is valid for the next <strong>10 minutes</strong>.</p>
            <p>Please do not share this code with anyone.</p>
            <p>Regards,<br/>Support Team</p>
            `, // HTML body
  })
};

module.exports = { sendOtpMail, sendDeliveryOtpMail };