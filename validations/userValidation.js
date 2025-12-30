const Joi = require("joi");
const mongoose = require("mongoose");

// Custom ObjectId validation
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid MongoDB ObjectId");
  }
  return value;
}, "ObjectId Validation");

const userValidationSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .pattern(/^[A-Za-z]+$/)
    .min(2)
    .max(50)
    .messages({
      "string.base": "First name must be a string",
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name must be at most 50 characters",
      "string.pattern.base": "First name can contain only letters",
    })
    .optional(),

  lastName: Joi.string()
    .trim()
    .pattern(/^[A-Za-z]+$/)
    .min(2)
    .max(50)
    .messages({
      "string.base": "Last name must be a string",
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name must be at most 50 characters",
      "string.pattern.base": "Last name can contain only letters",
    })
    .optional(),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .messages({
      "string.email": "Email must be a valid email address",
      "string.base": "Email must be a string",
    })
    .optional(),

  password: Joi.string()
    .min(6)
    .messages({
      "string.base": "Password must be a string",
      "string.min": "Password must be at least 6 characters",
    })
    .optional(),

  role: Joi.string()
    .valid("admin", "user", "trainer")
    .messages({
      "any.only": "Role must be one of admin, user, or trainer",
      "string.base": "Role must be a string",
    })
    .optional(),

  branch: objectId
    .messages({
      "string.base": "Branch must be a valid MongoDB ObjectId",
    })
    .optional(),

  enrolledCourses: Joi.array()
    .items(objectId)
    .messages({
      "array.base": "Enrolled courses must be an array of course IDs",
    })
    .optional(),

  trainerId: objectId
    .messages({
      "string.base": "Trainer ID must be a valid MongoDB ObjectId",
    })
    .optional(),

  lastLoginTimestamp: Joi.date()
    .messages({
      "date.base": "Last login timestamp must be a valid date",
    })
    .optional(),

  idCardVerificationStatus: Joi.string()
    .valid("pending", "approved", "rejected")
    .messages({
      "any.only":
        "ID Card verification status must be pending, approved, or rejected",
      "string.base": "ID Card verification status must be a string",
    })
    .optional(),

  isLogin: Joi.boolean()
    .messages({
      "boolean.base": "isLogin must be true or false",
    })
    .optional(),

  isActive: Joi.boolean()
    .messages({
      "boolean.base": "isActive must be true or false",
    })
    .optional(),
});

module.exports = userValidationSchema;
