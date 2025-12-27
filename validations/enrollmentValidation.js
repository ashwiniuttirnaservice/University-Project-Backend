const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId format");
  }
  return value;
}, "ObjectId Validation");

const enrollmentValidation = Joi.object({
  fullName: Joi.string()
    .trim()
    .pattern(/^[A-Za-z ]+$/)
    .min(3)
    .required()
    .messages({
      "string.pattern.base": "Full name must contain only alphabets and spaces",
      "string.min": "Full name must be at least 3 characters long",
      "any.required": "Full name is required",
    }),

  mobileNo: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Mobile number must be a valid 10-digit Indian number",
    }),

  email: Joi.string().email({ minDomainSegments: 2 }).optional().messages({
    "string.email": "Email must be a valid email address",
  }),

  password: Joi.string().min(6).optional().messages({
    "string.min": "Password must be at least 6 characters long",
  }),

  enrolledCourses: Joi.array().items(objectId).min(1).required().messages({
    "any.required": "Enrolled courses are required",
    "array.min": "At least one course must be enrolled",
  }),

  enrolledBatches: Joi.array().items(objectId).min(1).required().messages({
    "any.required": "Enrolled batches are required",
    "array.min": "At least one batch must be enrolled",
  }),
});

module.exports = enrollmentValidation;
