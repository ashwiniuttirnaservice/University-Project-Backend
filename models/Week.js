const mongoose = require("mongoose");
const WeekSchema = new mongoose.Schema(
  {
    phase: { type: mongoose.Schema.Types.ObjectId, ref: "Phase" },
    weekNumber: { type: Number, required: true },
    title: { type: String, required: true },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
  },
  { timestamps: true }
);
const Week = mongoose.model("Week", WeekSchema);
module.exports = Week; //
