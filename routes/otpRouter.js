const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  registerStudent,
  sendPasswordEmailAPI,
  verifyOtpEmail,
} = require("../controllers/otpController");

router.post("/send", sendOtp);
router.post("/verify", verifyOtp);
router.post("/student/register", registerStudent);
router.post("/send-email", sendPasswordEmailAPI);
router.post("/otp/verify-email", verifyOtpEmail);

module.exports = router;
