const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
    },
    selectedProgram: {
      type: String,
      required: true,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    transactionId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workshop", workshopSchema);
