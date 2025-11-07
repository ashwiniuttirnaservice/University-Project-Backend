const mongoose = require("mongoose");

const contactInfoSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    address: {
      line1: { type: String, required: true },
      landmark: { type: String },
      area: { type: String },
      city: { type: String, default: "Nashik" },
      postalCode: { type: String, default: "422005" },
    },
    googleMapLink: {
      type: String,
      default: "https://maps.google.com/",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phoneNumbers: [
      {
        type: String,
        required: true,
      },
    ],
    workingHours: {
      days: { type: String },
      time: { type: String },
    },
    about: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactInfo", contactInfoSchema);
