const mongoose = require("mongoose");
const ChapterSchema = new mongoose.Schema(
  {
    week: { type: mongoose.Schema.Types.ObjectId, ref: "Week" },
    title: { type: String, required: true },
    points: [
      {
        title: { type: String },
        description: { type: String },
      },
    ],
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],
    lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lecture" }],
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Assignment" }],
  },
  { timestamps: true }
);
const Chapter = mongoose.model("Chapter", ChapterSchema);
module.exports = Chapter;
