const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: { type: String, required: true, trim: true },
  content: { type: String, trim: true },
  file: { type: String, trim: true },

  duration: { type: String, trim: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Note", NoteSchema);
