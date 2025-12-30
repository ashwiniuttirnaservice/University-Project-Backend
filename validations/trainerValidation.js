const Joi = require("joi");

const mobileRegex = /^[6-9]\d{9}$/;
const urlRegex =
  /^(https?:\/\/)?([\w\d-]+\.)+[\w-]+(\/[\w\d-._~:/?#[\]@!$&'()*+,;=]*)?$/;

const trainerValidationSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 3 characters",
    "string.max": "Full name must not exceed 100 characters",
  }),

  title: Joi.string().allow("").optional(),

  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Enter a valid email address",
    "string.empty": "Email is required",
  }),

  mobileNo: Joi.string().pattern(mobileRegex).required().messages({
    "string.pattern.base": "Enter valid 10 digit mobile number",
    "string.empty": "Mobile number is required",
  }),

  dob: Joi.string().allow("").optional(),

  gender: Joi.string().valid("Male", "Female", "Other").required().messages({
    "any.only": "Gender must be Male, Female or Other",
    "string.empty": "Gender is required",
  }),

  address: Joi.object({
    add1: Joi.string().required().messages({
      "string.empty": "Address Line 1 is required",
    }),
    add2: Joi.string().allow("").optional(),
    taluka: Joi.string().allow("").optional(),
    dist: Joi.string().allow("").optional(),
    state: Joi.string().allow("").optional(),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .allow("")
      .optional()
      .messages({
        "string.pattern.base": "Pincode must be 6 digits",
      }),
  }).required(),

  highestQualification: Joi.string().required().messages({
    "string.empty": "Highest qualification is required",
  }),

  collegeName: Joi.string().allow("").optional(),

  totalExperience: Joi.string().required().messages({
    "string.empty": "Total experience is required",
  }),

  availableTiming: Joi.string().required().messages({
    "string.empty": "Available timing is required",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),

  linkedinProfile: Joi.string()
    .pattern(urlRegex)
    .allow("")
    .optional()
    .messages({
      "string.pattern.base": "Enter valid LinkedIn profile URL",
    }),

  summary: Joi.string().allow("").optional(),
  certifications: Joi.array().items(Joi.string()).optional(),
  achievements: Joi.array().items(Joi.string()).optional(),
  courses: Joi.array().items(Joi.string()).optional(),
  skills: Joi.array().items(Joi.string()).optional(),

  isActive: Joi.boolean().optional(),
  isLogin: Joi.boolean().optional(),
});

module.exports = trainerValidationSchema;
