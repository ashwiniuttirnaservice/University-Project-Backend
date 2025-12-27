const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    module: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Module", moduleSchema);
