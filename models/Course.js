const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: false,
    },

    rating: { type: Number, default: 4.9 },
    enrolledCount: { type: Number, default: 1200 },

    overview: {
      type: String,
      required: true,
    },
    learningOutcomes: [
      {
        type: String,
        required: true,
      },
    ],
    benefits: [
      {
        type: String,
        required: true,
      },
    ],
    keyFeatures: [
      {
        title: { type: String, required: true },
        description: { type: String },
        subPoints: [{ type: String }],
      },
    ],

    features: {
      certificate: { type: Boolean, default: true },
      codingExercises: { type: Boolean, default: true },
      recordedLectures: { type: Boolean, default: true },
    },

    videolectures: [
      { type: mongoose.Schema.Types.ObjectId, ref: "VideoLecture" },
    ],
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],

    trainer: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trainer",
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
