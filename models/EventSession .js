const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SessionCategory",
      required: true,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    location: { type: String, required: true },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Offline",
    },
    meetingLink: { type: String },

    organizer: { type: String, required: true },
    speakers: [{ type: String }],

    bannerImage: { type: String },
    gallery: [{ type: String }],

    registrationLink: { type: String },
    isFree: { type: Boolean, default: true },
    price: { type: Number, default: 0 },
    maxParticipants: { type: Number },
    registeredCount: { type: Number, default: 0 },

    status: {
      type: String,
    },

    tags: [{ type: String }],
    priority: { type: Number, default: 0 },

    agenda: [{ time: String, activity: String }],
    resources: [{ type: String }],
    sponsors: [{ type: String }],
    certificateAvailable: { type: Boolean, default: false },
    feedbackFormLink: { type: String },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EventSchema.pre("save", function (next) {
  const now = new Date();
  if (this.startDate <= now && this.endDate >= now) {
    this.status = "Ongoing";
  } else if (this.startDate > now) {
    this.status = "Upcoming";
  } else {
    this.status = "Past";
  }
  next();
});

module.exports = mongoose.model("Event", EventSchema);
