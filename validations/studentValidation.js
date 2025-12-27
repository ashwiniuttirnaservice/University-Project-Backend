const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid MongoDB ObjectId");
  }
  return value;
}, "ObjectId Validation");

const studentValidation = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      "string.base": "Full name must be a string",
      "string.empty": "Full name is required",
      "string.min": "Full name must be at least 2 characters",
      "string.max": "Full name must not exceed 100 characters",
      "string.pattern.base": "Full name must contain only letters",
      "any.required": "Full name is required",
    }),

  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  mobileNo: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Mobile number must be a valid 10-digit Indian number",
      "string.empty": "Mobile number is required",
      "any.required": "Mobile number is required",
    }),

  dob: Joi.date().less("now").optional().messages({
    "date.base": "Date of birth must be a valid date",
    "date.less": "Date of birth must be in the past",
  }),

  gender: Joi.string().valid("Male", "Female", "Other").optional().messages({
    "any.only": "Gender must be Male, Female or Other",
  }),

  selectedProgram: Joi.string()
    .valid(
      "Full Stack Web Development - 02-June-2025 Onwards (90 Days)",
      "Full Stack Mobile Development - 02-June-2025 Onwards (90 Days)"
    )
    .optional()
    .messages({
      "any.only": "Invalid program selected",
    }),

  address: Joi.object({
    add1: Joi.string().trim().optional(),
    add2: Joi.string().trim().optional(),
    taluka: Joi.string().trim().optional(),
    dist: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .optional()
      .messages({
        "string.pattern.base": "Pincode must be a 6-digit number",
      }),
  }).optional(),

  currentEducation: Joi.string().trim().optional(),

  status: Joi.string().trim().optional(),

  boardUniversityCollege: Joi.string().trim().optional(),

  branch: objectId.optional().messages({
    "string.base": "Branch must be a valid ObjectId",
  }),

  enrolledCourses: Joi.array().items(objectId).optional().messages({
    "array.base": "Enrolled courses must be an array",
  }),

  enrolledBatches: Joi.array().items(objectId).optional().messages({
    "array.base": "enrolledBatches courses must be an array",
  }),

  collegeName: Joi.string()
    .trim()
    .pattern(/^[A-Za-z\s]+$/)
    .optional()
    .messages({
      "string.pattern.base": "College name must contain only letters",
    }),

  assignmentSubmissions: Joi.array().items(objectId).optional(),

  coursesInterested: Joi.array().items(objectId).optional(),

  preferredBatchTiming: Joi.string().optional(),

  preferredMode: Joi.string()
    .valid("Online", "Offline", "Hybrid")
    .optional()
    .messages({
      "any.only": "Preferred mode must be Online, Offline or Hybrid",
    }),

  idProofStudent: Joi.string().optional(),

  profilePhotoStudent: Joi.string().allow("").optional(),

  password: Joi.string().min(6).max(30).optional().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 30 characters",
  }),

  role: Joi.string().valid("admin", "trainer", "student").optional().messages({
    "any.only": "Role must be admin, trainer or student",
  }),

  isActive: Joi.boolean().optional(),
}).unknown(false);

module.exports = {
  studentValidation,
};
