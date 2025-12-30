const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  registerStudent,
  sendPasswordEmailAPI,
  sendEmailOtp,
  verifyEmailOtp,
} = require("../controllers/otpController");

router.post("/send", sendOtp);
router.post("/verify", verifyOtp);
router.post("/student/register", registerStudent);
router.post("/send-email", sendPasswordEmailAPI);
router.post("/otp-send", sendEmailOtp);
router.post("/otp-verify", verifyEmailOtp);

module.exports = router;
