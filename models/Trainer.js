const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
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
    collegeName: {
      type: String,
    },
    totalExperience: {
      type: String,
      required: true,
    },

    resume: {
      type: String,
      required: true,
    },
    idProofTrainer: {
      type: String,
      required: true,
    },

    // --- Availability ---
    availableTiming: {
      type: String,
      required: true,
    },

    // --- Login & Profile ---
    password: {
      type: String,
      required: true,
    },
    profilePhotoTrainer: {
      type: String,
      default: "",
    },
    linkedinProfile: {
      type: String,
      default: "",
    },

    // rating: {
    //   type: Number,
    //   default: 0,
    // },
    // reviews: {
    //   type: Number,
    //   default: 0,
    // },
    summary: {
      type: String,
      default: "",
    },
    certifications: [String],
    achievements: [String],
    // testimonials: [
    //   {
    //     name: { type: String },
    //     company: { type: String },
    //     message: { type: String },
    //   },
    // ],

    // --- Approval Workflow ---
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

    // --- Relations ---
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],
    branches: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },

    // --- Status ---
    isActive: {
      type: Boolean,
      default: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Trainer = mongoose.model("Trainer", trainerSchema);
module.exports = Trainer;
