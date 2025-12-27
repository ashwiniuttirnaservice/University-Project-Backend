const Joi = require("joi");

const workshopSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.empty": "Title is required",
  }),

  description: Joi.string().trim().required().messages({
    "string.empty": "Description is required",
  }),

  startDate: Joi.date().required().messages({
    "date.base": "Start Date must be a valid date",
    "any.required": "Start Date is required",
  }),

  endDate: Joi.date().required().messages({
    "date.base": "End Date must be a valid date",
    "any.required": "End Date is required",
  }),

  duration: Joi.string().trim().required().messages({
    "string.empty": "Duration is required",
  }),

  location: Joi.string().trim().required().messages({
    "string.empty": "Location is required",
  }),

  prerequisites: Joi.array().items(Joi.string().trim()),

  topics: Joi.array().items(Joi.string().trim()),

  instructors: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().required().messages({
        "string.empty": "Instructor name is required",
      }),
      bio: Joi.string().trim().allow(""),
      experience: Joi.string().trim().allow(""),
    })
  ),

  registrationLink: Joi.string().uri().trim().allow("").messages({
    "string.uri": "Registration link must be a valid URL",
  }),

  fees: Joi.object({
    amount: Joi.number().min(0).default(0),
    currency: Joi.string().default("INR"),
    refundPolicy: Joi.string().trim().allow(""),
  }),

  certification: Joi.boolean().default(false),

  contact: Joi.object({
    email: Joi.string().email().trim().allow(""),
    phone: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .allow("")
      .messages({
        "string.pattern.base": "Phone must be 10-15 digits",
      }),
    socialMedia: Joi.string().trim().allow(""),
  }),

  status: Joi.string().valid("upcoming", "ongoing", "completed").optional(),

  createdAt: Joi.date().default(Date.now),
});

const validateWorkshop = (data) => {
  return workshopSchema.validate(data, { abortEarly: false });
};

module.exports = { validateWorkshop };
