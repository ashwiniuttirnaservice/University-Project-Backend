const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema(
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

    meetingDescription: {
      type: String,
      trim: true,
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
      trim: true,
    },

    meetingPassword: {
      type: String,
      trim: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
    },

    duration: {
      type: Number,
    },

    recordingUrl: {
      type: String,
    },

    status: {
      type: String,

      default: "scheduled",
    },

    notification: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Meeting", MeetingSchema);
