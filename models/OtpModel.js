import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  mobileNo: { type: String, required: false },
  otp: { type: String, required: true },
  reference_id: { type: String, required: true },
  is_verified: { type: Boolean, required: true, default: false },

  expiresAt: { type: Date, required: true },
});

export default mongoose.model("Otp", otpSchema);
