const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    contentUrl: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      default: 60,
    },

    type: {
      type: String,
    },

    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],
    status: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Lecture = mongoose.model("Lecture", LectureSchema);
module.exports = Lecture;
