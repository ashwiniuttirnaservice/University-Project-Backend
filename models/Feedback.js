const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },

    answer: {
      type: String,
      enum: ["agree", "disagree", "cant_say", ""],
      default: "",
    },

    numericValue: { type: Number },
  },
  { _id: false }
);

responseSchema.pre("validate", function (next) {
  const scoreMap = {
    agree: 2,
    disagree: 1,
    cant_say: 0,
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
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
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

    questions: [responseSchema],

    suggestions: { type: String, trim: true },

    trainerFeedback: { type: String, trim: true },

    profile: { type: String, trim: true },

    nps: npsSchema,

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
