const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    title: { type: String, required: true },
    questions: [
      {
        question: { type: String, required: true },
      },
    ],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeedbackQuestion", questionSchema);
