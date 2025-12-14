const mongoose = require("mongoose");

const npsQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      default:
        "How likely are you to recommend this learning program to your colleagues? (NPS question - Scale: 0-10)",
      immutable: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  { _id: false }
);

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

    nps: {
      type: npsQuestionSchema,
      default: () => ({}),
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeedbackQuestion", questionSchema);
