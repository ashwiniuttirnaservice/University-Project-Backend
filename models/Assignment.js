const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: false,
    },
    title: { type: String },
    description: { type: String },
    fileUrl: { type: String },
    deadline: { type: Date },
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        files: [{ type: String }],

        mistakePhotos: [{ type: String }],
        remarks: { type: String },
        status: {
          type: String,
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
