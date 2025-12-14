const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  chapterName: { type: String, default: "All" },
  question: { type: String, required: true },
  optionA: { type: String, required: true },
  optionB: { type: String, required: true },
  optionC: { type: String, default: "" },
  optionD: { type: String, default: "" },
  correctAns: { type: String, required: true },
  marks: { type: Number },
  selectedOption: { type: String, default: null },
  isCorrect: { type: Boolean, default: false },
});

const IQTestSchema = new mongoose.Schema(
  {
    testID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestList",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

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
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    questions: [QuestionSchema],

    status: {
      type: Number,
      enum: [0, 1, -1],
      default: 0,
    },

    testDuration: {
      minutes: { type: Number, default: 0 },
      seconds: { type: Number, default: 0 },
    },

    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    marksGained: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },

    userType: {
      type: String,

      default: "0",
    },

    isShared: { type: Boolean, default: false },
    reportType: { type: Number, default: 1 },
    report: { type: String, default: "" },
    certificate: { type: String, default: "" },
  },
  { timestamps: true }
);

const IQTest = mongoose.model("IQTest", IQTestSchema);
module.exports = IQTest;
