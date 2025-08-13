const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["student", "trainer", "admin"],
      default: "student",
    },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

    // --- NAYA FIELD YAHAN ADD KIYA HAI ---
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
    }, // ------------------------------------

    lastLoginTimestamp: { type: Date },
    idCardVerificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Password hashing

module.exports = mongoose.model("User", userSchema);
