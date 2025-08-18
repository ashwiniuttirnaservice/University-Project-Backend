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
      enum: ["video", "lecture"], // ✅ restricts to only two values
      required: true,
    },
    title: { type: String, required: true, trim: true },
    contentUrl: { type: String, trim: true }, // PDF, link, or video URL
    duration: { type: String, trim: true }, // HH:MM:SS or MM:SS
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

// ✅ Correct export with proper model name
module.exports =
  mongoose.models.VideoLecture ||
  mongoose.model("VideoLecture", VideoLectureSchema);
