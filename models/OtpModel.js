const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  mobileNo: { type: String, required: false },
  email: { type: String, required: false },
  otp: { type: String, required: true },
  password: { type: String, required: false },
  reference_id: { type: String, required: true },
  is_verified: { type: Boolean, required: true, default: false },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("Otp", otpSchema);
