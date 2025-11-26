const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },

    email: { type: String, required: true },

    password: { type: String, required: true, select: false },

    role: {
      type: String,
      enum: ["admin", "trainer", "student"],
      default: "admin", // default as you wrote
    },

    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

    // Only students will have enrolled courses
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    // If trainer — this links to trainer profile
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
    },

    lastLoginTimestamp: { type: Date },

    idCardVerificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
