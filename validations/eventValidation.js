const Joi = require("joi");

const eventSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must not exceed 200 characters",
  }),

  slug: Joi.string().trim().required().messages({
    "string.empty": "Slug is required",
  }),

  description: Joi.string().min(10).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters",
  }),

  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId
    .required()
    .messages({
      "string.empty": "Category is required",
      "string.pattern.base": "Invalid category ObjectId",
    }),

  startDate: Joi.date().required().messages({
    "date.base": "Start date must be valid",
    "any.required": "Start date is required",
  }),

  endDate: Joi.date().required().messages({
    "date.base": "End date must be valid",
    "any.required": "End date is required",
  }),

  startTime: Joi.string().required().messages({
    "string.empty": "Start time is required",
  }),

  endTime: Joi.string().required().messages({
    "string.empty": "End time is required",
  }),

  location: Joi.string().required().messages({
    "string.empty": "Location is required",
  }),

  mode: Joi.string().valid("Online", "Offline", "Hybrid").default("Offline"),

  meetingLink: Joi.string().uri().optional().messages({
    "string.uri": "Meeting link must be a valid URL",
  }),

  organizer: Joi.string().required().messages({
    "string.empty": "Organizer is required",
  }),

  speakers: Joi.array().items(Joi.string()),

  bannerImage: Joi.string().uri().optional(),
  gallery: Joi.array().items(Joi.string().uri()),

  registrationLink: Joi.string().uri().optional(),

  isFree: Joi.boolean().default(true),

  price: Joi.number().min(0).default(0).messages({
    "number.min": "Price cannot be negative",
  }),

  maxParticipants: Joi.number().min(1).optional(),
  registeredCount: Joi.number().default(0),

  status: Joi.string().valid("Upcoming", "Ongoing", "Past").optional(),

  tags: Joi.array().items(Joi.string().trim()),
  priority: Joi.number().default(0),

  agenda: Joi.array().items(
    Joi.object({
      time: Joi.string().required(),
      activity: Joi.string().required(),
    })
  ),

  resources: Joi.array().items(Joi.string().uri()),
  sponsors: Joi.array().items(Joi.string()),

  certificateAvailable: Joi.boolean().default(false),

  feedbackFormLink: Joi.string().uri().optional(),

  socialLinks: Joi.object({
    facebook: Joi.string().uri().optional(),
    instagram: Joi.string().uri().optional(),
    twitter: Joi.string().uri().optional(),
    linkedin: Joi.string().uri().optional(),
  }).optional(),

  isActive: Joi.boolean().default(true),
});

const validateEvent = (data) => {
  return eventSchema.validate(data, { abortEarly: true });
};

module.exports = { validateEvent };
