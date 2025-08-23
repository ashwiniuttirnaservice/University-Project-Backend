const mongoose = require("mongoose");

const HackathonSchema = new mongoose.Schema(
  {
    // Basic Details
    title: { type: String, required: true, trim: true }, // Hackathon name
    theme: { type: String, trim: true }, // Theme/problem statement
    description: { type: String, trim: true }, // Hackathon details
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    venue: { type: String, trim: true },

    // Mode of Hackathon
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Offline",
    },

    // Participation
    eligibility: { type: String, default: "College Students" },
    maxTeamSize: { type: Number, default: 4 },
    minTeamSize: { type: Number, default: 1 },
    registrationDeadline: { type: Date },

    // Teams
    teams: [
      {
        teamName: { type: String, required: true, trim: true },
        members: [
          {
            name: { type: String, required: true, trim: true },
            email: { type: String, required: true, trim: true },
            phone: { type: String, trim: true },
            college: { type: String, required: true, trim: true },
            year: { type: String, trim: true }, // FE/SE/TE/BE
            branch: { type: String, trim: true }, // Computer/IT/etc.
          },
        ],
        projectIdea: { type: String, trim: true },
        githubRepo: { type: String, trim: true },
        status: {
          type: String,
          enum: ["Registered", "Shortlisted", "Submitted", "Evaluated"],
          default: "Registered",
        },
      },
    ],

    // Judges
    judges: [
      {
        name: { type: String, trim: true },
        designation: { type: String, trim: true },
        organization: { type: String, trim: true },
        email: { type: String, trim: true },
      },
    ],

    // Sponsorships (Linked)
    sponsorships: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Sponsorship" },
    ],

    // Prizes
    prizes: [
      {
        position: { type: String, trim: true }, // Winner, Runner Up
        reward: { type: String, trim: true }, // e.g., ₹50,000 + Internship
      },
    ],

    // Rules
    rules: [String],

    // Status
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hackathon", HackathonSchema);
