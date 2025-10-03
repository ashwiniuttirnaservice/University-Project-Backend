const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: true,
      trim: true,
    },

    time: {
      start: {
        type: String,
        required: true,
      },
      end: {
        type: String,
        required: true,
      },
    },

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
        ref: "Enrollment",
      },
    ],

    studentCount: {
      type: Number,
      default: 0,
    },

    startDate: {
      type: String,
      required: false,
    },

    endDate: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Past"],
      default: "Upcoming",
    },

    isEnrolled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Batch", batchSchema);
