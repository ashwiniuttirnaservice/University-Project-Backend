const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,

    trim: true,
  },
  email: {
    type: String,

    lowercase: true,
    match: /^\S+@\S+\.\S+$/,
  },
  mobileNo: {
    type: String,

    match: /^[6-9]\d{9}$/,
  },
  dob: {
    type: Date,
  },
  gender: {
    type: String,
  },
  selectedProgram: {
    type: String,
    enum: [
      "Full Stack Web Development - 02-June-2025 Onwards (90 Days)",
      "Full Stack Mobile Development - 02-June-2025 Onwards (90 Days)",
    ],
    default: "Full Stack Web Development - 02-June-2025 Onwards (90 Days)",
  },
  address: {
    add1: { type: String },
    add2: { type: String },
    taluka: { type: String },
    dist: { type: String },
    state: { type: String },
    pincode: { type: String, match: /^\d{6}$/ },
  },
  currentEducation: {
    type: String,
  },
  status: {
    type: String,
  },
  boardUniversityCollege: {
    type: String,
  },

  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  collegeName: {
    type: String,

    trim: true,
  },
  assignmentSubmissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
    },
  ],
  coursesInterested: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],

  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  preferredBatchTiming: {
    type: String,
  },
  preferredMode: {
    type: String,
  },
  idProofStudent: {
    type: String,
  },
  profilePhotoStudent: {
    type: String,
    default: "",
  },
  password: {
    type: String,
  },

  registeredAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["admin", "trainer", "student"],
    default: "student",
  },

  isActive: {
    type: Boolean,
    default: true,
  },
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
