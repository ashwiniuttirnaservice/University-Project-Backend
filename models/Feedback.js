const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },

    answer: {
      type: String,

      default: "",
    },

    numericValue: { type: Number },
  },
  { _id: false },
);

responseSchema.pre("validate", function (next) {
  const scoreMap = {
    strongly_agree: 5,
    agree: 2,
    disagree: 0,
    cant_say: 1,
    "": null,
  };

  this.numericValue = scoreMap[this.answer] ?? null;
  next();
});

const npsSchema = new mongoose.Schema(
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
  { _id: false },
);

const feedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },

    feedbackQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedbackQuestion",
    },

    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },

    fullName: { type: String, trim: true },
    email: { type: String, trim: true },
    mobileNo: { type: String, trim: true },
    collegeName: { type: String, trim: true },
    questions: [responseSchema],

    suggestions: { type: String, trim: true },

    trainerFeedback: { type: String, trim: true },

    profile: { type: String, trim: true },
    status: {
      type: Number,
      default: 0,
    },

    nps: npsSchema,

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Feedback", feedbackSchema);
