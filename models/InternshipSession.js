const mongoose = require("mongoose");

const internshipSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
    },
    location: {
      type: String,
      trim: true,
    },

    topics: [{ type: String, trim: true }],

    capacity: { type: String, required: true },
    fees: {
      amount: { type: Number, default: 0 },

      refundPolicy: { type: String, trim: true },
    },

    certification: { type: Boolean, default: false },
    status: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InternshipSession", internshipSessionSchema);
