const mongoose = require("mongoose");

const VideoLectureSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "lecture"], // video for recorded videos, lecture for live/reading material
      required: true,
    },
    title: { type: String, required: true, trim: true },
    contentUrl: { type: String, trim: true }, // for lecture PDF/article link
    duration: { type: String, trim: true }, // format: HH:MM:SS or MM:SS
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.VideoLecture || mongoose.model("Video", VideoLectureSchema);
