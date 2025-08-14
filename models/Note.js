const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: { type: String, required: true, trim: true },
  content: { type: String, trim: true },
  file: { type: String, trim: true }, // PDF/Document file URL
  type: {
    type: String,
    enum: ["text", "article"],
    default: "text",
  },
  duration: { type: String, trim: true }, // format: HH:MM:SS or MM:SS
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Note || mongoose.model("Note", NoteSchema);
