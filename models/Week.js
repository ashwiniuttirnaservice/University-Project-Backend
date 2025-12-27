const mongoose = require("mongoose");
const WeekSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    phase: { type: mongoose.Schema.Types.ObjectId, ref: "Phase" },
    weekNumber: { type: Number, required: false },
    title: { type: String, required: true },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
const Week = mongoose.model("Week", WeekSchema);
module.exports = Week;
