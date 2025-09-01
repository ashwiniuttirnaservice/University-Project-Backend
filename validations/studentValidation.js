const Joi = require("joi");
const mongoose = require("mongoose");

const studentSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),

  email: Joi.string().email().required().messages({
    "string.email": "Valid email is required",
    "any.required": "Email is required",
  }),

  mobileNo: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Mobile number must be a valid 10-digit Indian number",
    }),

  dob: Joi.date().less("now").messages({
    "date.less": "Date of birth must be in the past",
  }),

  gender: Joi.string().valid("Male", "Female", "Other").optional(),

  selectedProgram: Joi.string()
    .valid(
      "Full Stack Web Development - 02-June-2025 Onwards (90 Days)",
      "Full Stack Mobile Development - 02-June-2025 Onwards (90 Days)"
    )
    .default("Full Stack Web Development - 02-June-2025 Onwards (90 Days)"),

  address: Joi.object({
    add1: Joi.string().allow("").optional(),
    add2: Joi.string().allow("").optional(),
    taluka: Joi.string().allow("").optional(),
    dist: Joi.string().allow("").optional(),
    state: Joi.string().allow("").optional(),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .optional()
      .messages({
        "string.pattern.base": "Pincode must be a 6-digit number",
      }),
  }).optional(),

  currentEducation: Joi.string().optional(),

  status: Joi.string().valid("Active", "Inactive", "Pending").optional(),

  boardUniversityCollege: Joi.string().optional(),

  branch: Joi.string()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation")
    .optional(),

  enrolledCourses: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("any.invalid");
        }
        return value;
      }, "ObjectId Validation")
    )
    .optional(),

  collegeName: Joi.string().allow("").optional(),

  coursesInterested: Joi.array().items(Joi.string()).optional(),

  preferredBatchTiming: Joi.string().allow("").optional(),

  preferredMode: Joi.string().valid("Online", "Offline", "Hybrid").optional(),

  idProofStudent: Joi.string().uri().optional(),

  profilePhotoStudent: Joi.string().uri().optional(),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),

  registeredAt: Joi.date().default(Date.now),
});

const validateStudent = (data) => {
  return studentSchema.validate(data, { abortEarly: true });
};

module.exports = { validateStudent };
