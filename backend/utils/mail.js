const nodemailer = require("nodemailer");
const dotenv = require("dotenv")
dotenv.config();

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true, // Use true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

const sendOtpMail = async function (to, otp) {
  await transporter.sendMail({
    from: process.env.EMAIL, // sender address
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
  await transporter.sendMail({
    from: process.env.EMAIL, // sender address
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