const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message(`"${value}" is not a valid ObjectId`);
  }
  return value;
};

const enrollmentSchema = Joi.object({
  user: Joi.string().custom(objectId, "ObjectId validation").optional(),

  studentId: Joi.string().custom(objectId, "ObjectId validation").optional(),

  course: Joi.string().custom(objectId, "ObjectId validation").optional(),

  enrolledAt: Joi.date().default(Date.now),

  completedContent: Joi.array().items(
    Joi.string().custom(objectId, "ObjectId validation")
  ),

  fullName: Joi.string().trim().required().messages({
    "any.required": "Full name is required",
  }),

  mobileNo: Joi.string()
    .trim()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Mobile number must be 10 to 15 digits",
      "any.required": "Mobile number is required",
    }),

  email: Joi.string().trim().lowercase().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),

  collegeName: Joi.string().trim().allow("").optional(),
});

const validateEnrollment = (data) => {
  return enrollmentSchema.validate(data, { abortEarly: true });
};

module.exports = validateEnrollment;
