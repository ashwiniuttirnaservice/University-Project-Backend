const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: false },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: false,
    },
    courseImage: {
      type: String,
      default: "",
    },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },

    rating: { type: Number, required: false, default: 4.9 },
    enrolledCount: { type: Number, required: false, default: 1200 },

    overview: {
      type: String,
      required: false,
    },
    learningOutcomes: [
      {
        type: String,
        required: false,
      },
    ],
    benefits: [
      {
        type: String,
        required: false,
      },
    ],
    keyFeatures: [
      {
        title: { type: String, required: false },
        description: { type: String, required: false },
        subPoints: [{ type: String, required: false }],
      },
    ],

    features: {
      certificate: { type: Boolean, default: true },
      codingExercises: { type: Boolean, default: true },
      recordedLectures: { type: Boolean, default: true },
    },
    fees: {
      type: String,
    },

    trainingPlan: {
      folderName: { type: String, default: null, required: false },
      fileName: { type: String, default: null, required: false },
      originalName: { type: String, default: null, required: false },
      fileType: { type: String, default: null, required: false },
    },

    videolectures: [
      { type: mongoose.Schema.Types.ObjectId, ref: "VideoLecture" },
    ],
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Note" }],

    trainer: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trainer",
        required: false,
      },
    ],
    batches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }],
    phases: [{ type: mongoose.Types.ObjectId, ref: "Phase" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
