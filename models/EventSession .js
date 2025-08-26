const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: false },
    slug: { type: String, required: false, unique: true },
    description: { type: String, required: false },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SessionCategory",
      required: false,
    },

    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    startTime: { type: String, required: false },
    endTime: { type: String, required: false },

    location: { type: String, required: true },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Offline",
    },
    meetingLink: { type: String },

    organizer: { type: String },
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
