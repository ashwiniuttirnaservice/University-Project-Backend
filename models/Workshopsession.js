const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    description: { type: String, required: true, trim: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    duration: { type: String, required: true },

    location: { type: String, required: true },

    prerequisites: [{ type: String, trim: true }],

    topics: [{ type: String, trim: true }],

    instructors: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],

    registrationLink: { type: String, trim: true },

    fees: {
      type: String,
      trim: true,
    },

    isFree: { type: Boolean, default: true },

    certification: { type: Boolean, default: false },

    contact: {
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      socialMedia: { type: String, trim: true },
    },
    status: {
      type: String,
    },
    createdAt: { type: Date, default: Date.now },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workshop", workshopSchema);
