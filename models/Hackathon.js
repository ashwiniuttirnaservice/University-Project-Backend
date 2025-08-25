const mongoose = require("mongoose");

const HackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    theme: { type: String, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    venue: { type: String, trim: true },

    mode: {
      type: String,
      default: "Offline",
    },

    eligibility: { type: String, default: "College Students" },
    maxTeamSize: { type: Number, default: 4 },
    minTeamSize: { type: Number, default: 1 },
    registrationDeadline: { type: Date },

    teams: [
      {
        teamName: { type: String, required: true, trim: true },
        members: [
          {
            name: { type: String, required: true, trim: true },
            email: { type: String, required: true, trim: true },
            phone: { type: String, trim: true },
            college: { type: String, required: true, trim: true },
            year: { type: String, trim: true },
            branch: { type: String, trim: true },
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

    judges: [
      {
        name: { type: String, trim: true },
        designation: { type: String, trim: true },
        organization: { type: String, trim: true },
        email: { type: String, trim: true },
      },
    ],

    sponsorships: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Sponsorship" },
    ],

    prizes: [
      {
        position: { type: String, trim: true },
        reward: { type: String, trim: true },
      },
    ],

    rules: [String],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hackathon", HackathonSchema);
