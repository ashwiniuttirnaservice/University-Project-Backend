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
      enum: ["video", "lecture"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    contentUrl: { type: String, trim: true },
    duration: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VideoLecture", VideoLectureSchema);
