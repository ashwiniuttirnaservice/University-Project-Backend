// const mongoose = require("mongoose");
// const LectureSchema = new mongoose.Schema(
//   {
//     chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
//     title: { type: String, required: true },
//     contentUrl: { type: String },
//     duration: { type: String },
//     description: { type: String },
//     status: {
//       type: String,
//       enum: ["pending", "in-progress", "completed"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );
// const Lecture = mongoose.model("Lecture", LectureSchema);
// module.exports = Lecture;

const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema(
  {
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    contentUrl: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
    },
    duration: {
      type: Number,
      default: 60,
    },
    startDateTime: {
      type: Date,
      required: true,
    },
    requiredRecordingWatchPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    host: {
      type: String,
      trim: true,
    },
    showRecordedVideo: {
      type: Boolean,
      default: true,
    },
    allowFreePreview: {
      type: Boolean,
      default: false,
    },
    bypassProgressiveLock: {
      type: Boolean,
      default: false,
    },
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Lecture = mongoose.model("Lecture", LectureSchema);
module.exports = Lecture;
