const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  registerStudent,
} = require("../controllers/otpController");

router.post("/send", sendOtp);
router.post("/verify", verifyOtp);
router.post("/student/register", registerStudent);

module.exports = router;
