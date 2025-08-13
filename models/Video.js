const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  videoUrl: { type: String, trim: true },
  description: { type: String, trim: true },
});

module.exports = mongoose.models || mongoose.model("Video", VideoSchema);
