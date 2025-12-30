const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      default: null,
    },

    assignedStudents: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        autoCreated: {
          type: Boolean,
          default: false,
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    assignedTrainers: [
      {
        trainerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Trainer",
          required: true,
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    submissions: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },

        zipFile: {
          type: String,
        },

        gitLink: {
          type: String,
        },

        submittedAt: {
          type: Date,
          default: Date.now,
        },

        reviewStatus: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },

        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        reviewedAt: {
          type: Date,
        },

        remarks: {
          type: String,
          trim: true,
        },
      },
    ],

    status: {
      type: String,
      enum: [
        "Not Started",
        "In Progress",
        "Submitted",
        "Evaluated",
        "Completed",
      ],
      default: "Not Started",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", ProjectSchema);
