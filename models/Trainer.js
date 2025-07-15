import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    // unique: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/,
  },
  mobileNo: {
    type: String,
    required: true,
    // unique: true,
    match: /^[6-9]\d{9}$/,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  address: {
    add1: { type: String, required: true },
    add2: { type: String },
    taluka: { type: String },
    dist: { type: String },
    state: { type: String },
    pincode: { type: String },
  },
  highestQualification: {
    type: String,
    required: true,
  },
  specializations: {
    type: [String],
    required: true,
  },
  collegeName: {
    type: String,
    required: true,
  },
  totalExperience: {
    type: String,
    required: true,
  },
  subjectExperience: {
    type: [String],
    default: [],
  },
  resume: {
    type: String,
    required: true,
  },
  idProof: {
    type: String,
    required: true,
  },
  availableTiming: {
    workingDays: {
      type: [String],
      default: [],
    },
    weeklyOff: {
      type: [String],
      default: [],
    },
    custom: {
      type: String,
      default: "",
    },
  },
  password: {
    type: String,
    required: true,
  },
  profilePhoto: {
    type: String,
    default: "",
  },
  linkedinProfile: {
    type: String,
    default: "",
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedBy: {
    type: String,
    default: "",
  },
  approvalDate: {
    type: Date,
  },

  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Trainer", trainerSchema);
