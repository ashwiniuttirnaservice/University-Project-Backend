const mongoose = require("mongoose");

const PrerequisiteProgressSchema = new mongoose.Schema(
  {
    prerequisiteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prerequisite",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PrerequisiteProgress",
  PrerequisiteProgressSchema
);
