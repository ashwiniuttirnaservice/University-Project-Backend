const mongoose = require("mongoose");
const AssignmentSchema = new mongoose.Schema(
  {
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ["pending", "submitted", "reviewed", "completed"],
      default: "pending",
    },
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const Assignment = mongoose.model("Assignment", AssignmentSchema);
module.exports = Assignment;
