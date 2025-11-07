const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true,
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

    attendees: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        batch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Batch",
          required: true,
        },
        present: {
          type: Boolean,
          default: false,
        },
      },
    ],

    markedByTrainer: {
      type: Boolean,
      default: false,
    },
    markedAt: {
      type: Date,
      default: Date.now,
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

module.exports = mongoose.model("Attendance", AttendanceSchema);
