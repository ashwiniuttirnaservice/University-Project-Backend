const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  registerStudent,
  sendOtpEmailController,
  verifyOtpEmail,
} = require("../controllers/otpController");

router.post("/send", sendOtp);
router.post("/verify", verifyOtp);
router.post("/student/register", registerStudent);
router.post("/send-email", sendOtpEmailController);
router.post("/otp/verify-email", verifyOtpEmail);

module.exports = router;
