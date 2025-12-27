const mongoose = require("mongoose");

const PrerequisiteSchema = new mongoose.Schema(
  {
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

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    topics: [
      {
        name: {
          type: String,
          required: true,
        },

        videoLinks: {
          type: String,
        },

        materialFiles: [
          {
            type: String,
          },
        ],
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prerequisite", PrerequisiteSchema);
