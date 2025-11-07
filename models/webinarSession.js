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
      type: String,
      required: true,
    },
    endTime: {
      type: String,
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
      type: String,
    },
    platform: {
      type: String,
      required: true,
    },
    meetingLink: {
      type: String,
      required: true,
    },
    meetingId: {
      type: String,
    },
    meetingdescription: {
      type: String,
      trim: true,
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
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Webinar", webinarSchema);
