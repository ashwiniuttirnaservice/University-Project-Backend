const Joi = require("joi");
const mongoose = require("mongoose");

const trainerSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(100).required(),

  title: Joi.string().allow("").optional(),

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

  dob: Joi.string().required(),

  gender: Joi.string().valid("Male", "Female", "Other").required(),

  address: Joi.object({
    add1: Joi.string().required(),
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
  }).required(),

  highestQualification: Joi.string().required(),

  collegeName: Joi.string().allow("").optional(),

  totalExperience: Joi.string().required(),

  resume: Joi.string().uri().required(),

  idProofTrainer: Joi.string().uri().optional(),

  availableTiming: Joi.string().required(),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),

  profilePhotoTrainer: Joi.string().uri().allow("").optional(),

  linkedinProfile: Joi.string().uri().allow("").optional(),

  summary: Joi.string().allow("").optional(),

  certifications: Joi.array().items(Joi.string()).optional(),

  achievements: Joi.array().items(Joi.string()).optional(),

  isApproved: Joi.boolean().default(false),

  approvalStatus: Joi.string()
    .valid("pending", "approved", "rejected")
    .default("pending"),

  approvedBy: Joi.string().allow("").optional(),

  approvalDate: Joi.date().optional(),

  courses: Joi.array().items(
    Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation")
  ),

  batches: Joi.array().items(
    Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation")
  ),

  branches: Joi.string()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation")
    .optional(),

  isActive: Joi.boolean().default(true),

  registeredAt: Joi.date().default(Date.now),
});

const validateTrainer = (data) => {
  return trainerSchema.validate(data, { abortEarly: true });
};

module.exports = { validateTrainer };
