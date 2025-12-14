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
    feedbacks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeedbackQuestion",
      },
    ],
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Assignment" }],
    attendances: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attendance" }],

    notes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      },
    ],
    tests: [{ type: mongoose.Schema.Types.ObjectId, ref: "TestList" }],

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

    trainer: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trainer",
      },
    ],

    additionalNotes: {
      type: String,
      default: "",
    },

    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Prerequisite",
      },
    ],

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

    iqTests: [{ type: mongoose.Schema.Types.ObjectId, ref: "IQTest" }],

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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Batch", batchSchema);
