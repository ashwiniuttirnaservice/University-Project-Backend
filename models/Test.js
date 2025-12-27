const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  chapterName: { type: String, default: "All" },
  question: { type: String, required: true },
  optionA: { type: String, required: true },
  optionB: { type: String, required: true },
  optionC: { type: String, default: "" },
  optionD: { type: String, default: "" },
  correctAns: { type: String, required: true },
  marks: { type: Number, default: 1 },
  selectedOption: { type: String, default: null },
  isCorrect: { type: Boolean, default: false },
});

const TestListSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
    phaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Phase",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    testLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    questions: [QuestionSchema],
    testDuration: {
      minutes: { type: Number, default: 0 },
      seconds: { type: Number, default: 0 },
    },
    totalQuestions: { type: Number },
    totalMarks: { type: Number },
    passingMarks: { type: Number },
    userType: { type: String, default: "0" },
    visible: { type: Boolean, default: true },
    reportType: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestList", TestListSchema);
