const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  completedContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],

  fullName: {
    type: String,
    required: true,
    trim: true,
  },

  mobileNo: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  collegeName: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
