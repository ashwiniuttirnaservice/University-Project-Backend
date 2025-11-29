const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const getEmailTransporter = () => {
  return nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.NODE_MAILER_EID,
      pass: process.env.NODE_MAILER_KEY,
    },
  });
};

const sendOtpEmail = (email_id, otp) => {
  const transporter = getEmailTransporter();

  const mailOptions = {
    from: process.env.NODE_MAILER_EID,
    to: email_id,
    subject: "Your OTP for Login Verification",
    html: `
      <p>Dear User,</p>
      <p>Your One-Time Password (OTP) for verification into the <strong>CAREERJUPITER</strong> portal is:</p>
      <h2 style="color: #2e6da4;">${otp}</h2>
      <p>This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone for security reasons.</p>
      <br/>
      <p>Best regards,<br/>The CAREERJUPITER Team</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
