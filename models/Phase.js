const mongoose = require("mongoose");

const PhaseSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "Course",
    },
    title: { type: String, required: true },
    description: { type: String },
    weeks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Week" }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Phase = mongoose.model("Phase", PhaseSchema);
module.exports = Phase;
