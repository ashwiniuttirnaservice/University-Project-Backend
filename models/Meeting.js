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
      enum: ["Zoom", "Google Meet", "Microsoft Teams", "Offline"],
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
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    duration: {
      type: String, // HH:MM
    },

    recordingUrl: {
      type: String,
    },

    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
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

    recurrenceGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

MeetingSchema.virtual("occurrences", {
  ref: "Meeting",
  localField: "recurrenceGroupId",
  foreignField: "recurrenceGroupId",
});

module.exports = mongoose.model("Meeting", MeetingSchema);
