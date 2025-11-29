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
      type: String,
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
      required: false,
    },

    availableTiming: {
      type: String,
      required: true,
    },

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

    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    batches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }],

    isActive: {
      type: Boolean,
      default: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ["admin", "trainer", "student"],
      default: "trainer",
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
