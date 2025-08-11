const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: true,
      trim: true,
    },
    timing: {
      type: String,
      required: true,
    },
    mode: {
      type: String,

      required: true,
    },
    coursesAssigned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    trainersAssigned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trainer",
      },
    ],
    additionalNotes: {
      type: String,
      default: "",
    },
    students: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        fullName: String,
        email: String,
      },
    ],
    studentCount: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Batch", batchSchema);
