const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false,
    },
    fullName: { type: String, required: true, trim: true },

    mobileNo: {
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

    profile: { type: String, trim: true },

    rating: { type: String, trim: true, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
