const mongoose = require("mongoose");
const LectureSchema = new mongoose.Schema(
  {
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    title: { type: String, required: true },
    contentUrl: { type: String },
    duration: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);
const Lecture = mongoose.model("Lecture", LectureSchema);
module.exports = Lecture;
