const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: { type: String, required: true },
  content: { type: String },
  url: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  type: {
    type: String,

    default: "text",
  },

  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Note || mongoose.model("Note", NoteSchema);
