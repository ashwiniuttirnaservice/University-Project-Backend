const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    title: { type: String },
    description: { type: String },
    fileUrl: { type: String },
    deadline: { type: Date },

    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment" },
        fileUrl: { type: String },
        remarks: { type: String },
        status: {
          type: String,
          enum: ["submitted", "reviewed", "completed"],
          default: "submitted",
        },
        score: { type: Number, default: 0 },
        submittedAt: { type: Date, default: Date.now },
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);
