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
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer", // Reference to Trainer model
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    duration: {
      type: String, // e.g., "2 hours", "3 days"
      required: true,
    },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
    },
    location: {
      type: String, // Required if Offline
      trim: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student", // Reference to Student model
      },
    ],
    resources: [
      {
        name: String,
        link: String,
      },
    ],
    feedback: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InternshipSession", internshipSessionSchema);
