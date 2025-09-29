const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: true,
      trim: true,
    },

    // ⏰ Daily Timing
    time: {
      start: {
        type: String, // e.g. "09:00 AM"
        required: true,
      },
      end: {
        type: String, // e.g. "11:00 AM"
        required: true,
      },
    },

    // ✅ Selective Days
    days: [
      {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        required: true,
      },
    ],

    mode: {
      type: String,
      required: true,
      enum: ["Online", "Offline", "Hybrid"],
    },

    coursesAssigned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    trainersAssigned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trainer",
      },
    ],

    additionalNotes: {
      type: String,
      default: "",
    },

    students: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        fullName: String,
        email: String,
      },
    ],

    enrolledIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    studentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Batch", batchSchema);
