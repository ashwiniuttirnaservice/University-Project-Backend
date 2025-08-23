const mongoose = require("mongoose");

const SponsorshipSchema = new mongoose.Schema(
  {
    sponsorName: { type: String, required: true },
    sponsorType: {
      type: String,
      enum: ["Platinum", "Gold", "Silver", "Bronze", "Community", "Other"],
      required: true,
    },
    logo: { type: String },
    website: { type: String },
    contactPerson: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    contribution: {
      amount: { type: Number, default: 0 },
      inKind: { type: String },
    },
    benefits: [String],
    agreementSigned: { type: Boolean, default: false },
    hackathon: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon" },
    sessionCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SessionCategory",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sponsorship", SponsorshipSchema);
