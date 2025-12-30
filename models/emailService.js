const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODE_MAILER_EID,
    pass: process.env.NODE_MAILER_KEY,
  },
});

/* ===============================
   SEND PASSWORD EMAIL
================================ */
exports.sendPasswordEmail = async (email, password) => {
  try {
    const mailOptions = {
      from: `"CAREERJUPITER" <${process.env.NODE_MAILER_EID}>`,
      to: email,
      subject: "Your LMS Login Password",
      html: `
        <p>Hello,</p>
        <p>Your LMS login password is:</p>
        <h2>${password}</h2>
        <p>Please login and change your password.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Password email sent to:", email);
  } catch (error) {
    console.error("Password email error:", error.message);
    throw new Error("Email sending failed");
  }
};

/* ===============================
   SEND OTP EMAIL
================================ */
exports.sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"CAREERJUPITER" <${process.env.NODE_MAILER_EID}>`,
      to: email,
      subject: "OTP Verification - CAREERJUPITER",
      html: `
        Your OTP for UTTIRNA portal login verification is ${otp}. Do not share this code with anyone. It is valid for 10 minutes. UTRLLP
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP email sent to:", email);
  } catch (error) {
    console.error("OTP email error:", error.message);
    throw new Error("OTP email sending failed");
  }
};
