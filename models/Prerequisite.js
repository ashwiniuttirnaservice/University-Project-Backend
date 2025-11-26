const mongoose = require("mongoose");

const PrerequisiteSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
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

    videoLinks: [
      {
        type: String,
      },
    ],

    materialFiles: [
      {
        fileName: String,
        filePath: String,
        fileType: String,
      },
    ],

    topics: [
      {
        type: String,
      },
    ],

    type: {
      type: String,
      enum: ["video", "pdf", "mixed"],
      default: "video",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prerequisite", PrerequisiteSchema);
