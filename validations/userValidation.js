const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid MongoDB ObjectId");
  }
  return value;
}, "ObjectId Validation");

const createUserValidation = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[A-Za-z\s]+$/)
    .optional()
    .messages({
      "string.base": "First name must be a string",
      "string.empty": "First name cannot be empty",
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name must not exceed 50 characters",
      "string.pattern.base": "First name must contain only letters (A-Z)",
    }),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[A-Za-z\s]+$/)
    .optional()
    .messages({
      "string.base": "Last name must be a string",
      "string.empty": "Last name cannot be empty",
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name must not exceed 50 characters",
      "string.pattern.base": "Last name must contain only letters (A-Z)",
    }),

  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).max(30).required().messages({
    "string.base": "Password must be a string",
    "string.min": "Password must be at least 6  characters",
    "string.max": "Password must not exceed 30 characters",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
  branch: objectId.optional().messages({
    "string.base": "Branch must be a valid ObjectId",
  }),

  enrolledCourses: Joi.array().items(objectId).optional().messages({
    "array.base": "Enrolled courses must be an array",
  }),

  trainerId: objectId.optional().messages({
    "string.base": "Trainer ID must be a valid ObjectId",
  }),

  lastLoginTimestamp: Joi.date().optional().messages({
    "date.base": "Last login timestamp must be a valid date",
  }),
  role: Joi.string()
    .valid("admin", "trainer", "student", "user")
    .optional()
    .messages({
      "string.base": "Role must be a string",
      "any.only": "Role must be admin, trainer, student or user",
    }),

  idCardVerificationStatus: Joi.string()
    .valid("pending", "approved", "rejected")
    .optional()
    .messages({
      "string.base": "ID card verification status must be a string",
      "any.only":
        "ID card verification status must be pending, approved or rejected",
    }),

  isLogin: Joi.boolean().optional().messages({
    "boolean.base": "isLogin must be true or false",
  }),

  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be true or false",
  }),
}).unknown(false);

module.exports = {
  createUserValidation,
};
