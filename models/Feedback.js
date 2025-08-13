const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^[6-9]\d{9}$/,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
    },
    collegeName: { type: String, trim: true },
    message: { type: String, required: true, maxlength: 1000 },
    ratings: {
      teaching: { type: Number, min: 1, max: 10, required: true },
      presentations: { type: Number, min: 1, max: 10, required: true },
      engagement: { type: Number, min: 1, max: 10, required: true },
      pacing: { type: Number, min: 1, max: 10, required: true },
      organization: { type: Number, min: 1, max: 10, required: true },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
