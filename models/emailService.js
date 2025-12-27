const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// ✔ Create transporter here
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODE_MAILER_EID,
    pass: process.env.NODE_MAILER_KEY,
  },
});

// ✔ Exported function which works 100%
exports.sendPasswordEmail = async (email, password) => {
  try {
    const mailOptions = {
      from: process.env.NODE_MAILER_EID,
      to: email,
      subject: "Your LMS Login Password",
      html: `
        <p>Hello,</p>
        <p>Your LMS login password is: <b>${password}</b></p>
        <p>Please login and change your password.</p>
      `,
    };

    console.log(mailOptions, "=mail options");
    console.log(
      {
        user: process.env.NODE_MAILER_EID,
        pass: process.env.NODE_MAILER_KEY,
      },
      "=auth data"
    );

    await transporter.sendMail(mailOptions);
    console.log("Password email sent to:", email);
  } catch (error) {
    console.log(error, "=error email transporter...");
    console.error("Email send error:", error.message);
    throw new Error("Email sending failed");
  }
};
