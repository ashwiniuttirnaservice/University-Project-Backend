const mongoose = require("mongoose");

const webinarSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // e.g. "10:00 AM"
      required: true,
    },
    endTime: {
      type: String, // e.g. "12:00 PM"
    },
    speakerName: {
      type: String,
      required: true,
      trim: true,
    },
    speakerBio: {
      type: String,
      trim: true,
    },
    speakerPhoto: {
      type: String, // URL of the photo
    },
    platform: {
      type: String, // e.g. "Zoom", "Google Meet"
      required: true,
    },
    meetingLink: {
      type: String,
      required: true,
    },
    meetingId: {
      type: String,
    },
    passcode: {
      type: String,
    },
    registrationRequired: {
      type: Boolean,
      default: true,
    },
    maxParticipants: {
      type: Number,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Webinar", webinarSchema);
