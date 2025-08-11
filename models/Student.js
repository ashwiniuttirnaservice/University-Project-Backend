const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/,
  },
  mobileNo: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
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
    add1: { type: String, required: true },
    add2: { type: String },
    taluka: { type: String },
    dist: { type: String },
    state: { type: String },
    pincode: { type: String, match: /^\d{6}$/ },
  },
  currentEducation: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  boardUniversityCollege: {
    type: String,
    required: true,
  },

  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

  // --- NAYA FIELD YAHAN ADD KIYA HAI ---
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  collegeName: {
    type: String,
    required: true,
    trim: true,
  },
  coursesInterested: {
    type: [String],
    required: false,
  },
  preferredBatchTiming: {
    type: String,
    required: true,
  },
  preferredMode: {
    type: String,
    required: true,
  },
  idProofStudent: {
    type: String,
    required: true,
  },
  profilePhotoStudent: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
