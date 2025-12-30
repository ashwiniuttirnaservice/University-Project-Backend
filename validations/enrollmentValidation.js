const Joi = require("joi");

const mongoose = require("mongoose");

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid MongoDB ObjectId");
  }
  return value;
}, "ObjectId Validation");

const enrollmentValidationSchema = Joi.object({
  user: objectId
    .messages({
      "string.base": "User ID must be a valid MongoDB ObjectId",
    })
    .optional(),

  studentId: objectId
    .messages({
      "string.base": "Student ID must be a valid MongoDB ObjectId",
    })
    .optional(),

  assignmentSubmissions: Joi.array()
    .items(objectId)
    .messages({
      "array.base": "Assignment submissions must be an array of IDs",
    })
    .optional(),

  enrolledCourses: Joi.array()
    .items(objectId)
    .min(1)
    .messages({
      "array.base": "Enrolled courses must be an array",
      "array.min": "At least one course must be selected",
    })
    .optional(),

  enrolledBatches: Joi.array()
    .items(objectId)
    .min(1)
    .messages({
      "array.base": "Enrolled batches must be an array",
      "array.min": "At least one batch must be selected",
    })
    .optional(),

  attendances: Joi.array()
    .items(objectId)
    .messages({
      "array.base": "Attendances must be an array of IDs",
    })
    .optional(),

  coursesInterested: Joi.array()
    .items(objectId)
    .messages({
      "array.base": "Courses interested must be an array of course IDs",
    })
    .optional(),

  enrolledAt: Joi.date()
    .messages({
      "date.base": "Enrolled date must be a valid date",
    })
    .optional(),

  isActive: Joi.boolean()
    .messages({
      "boolean.base": "isActive must be true or false",
    })
    .optional(),

  fullName: Joi.string()
    .trim()
    .pattern(/^[A-Za-z ]+$/)
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty": "Full name is required",
      "string.pattern.base": "Full name can contain only letters and spaces",
      "string.min": "Full name must be at least 3 characters",
      "string.max": "Full name must be at most 100 characters",
    }),

  mobileNo: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .messages({
      "string.pattern.base":
        "Mobile number must be a valid 10-digit Indian number",
    })
    .optional(),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .messages({
      "string.email": "Email must be a valid email address",
    })
    .optional(),

  password: Joi.string()
    .min(6)
    .messages({
      "string.min": "Password must be at least 6 characters",
    })
    .optional(),

  designation: Joi.string()
    .trim()
    .messages({
      "string.base": "Designation must be a string",
    })
    .optional(),

  profilePhotoStudent: Joi.string()
    .allow("")
    .messages({
      "string.base": "Profile photo must be a string",
    })
    .optional(),

  collegeName: Joi.string()
    .trim()
    .messages({
      "string.base": "College name must be a string",
    })
    .optional(),
});

module.exports = enrollmentValidationSchema;
