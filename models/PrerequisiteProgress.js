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
      ref: "User",
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    topicsProgress: [
      {
        topicId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        topicName: String,
        isCompleted: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
      },
    ],

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PrerequisiteProgress",
  PrerequisiteProgressSchema
);
