const Joi = require("joi");
const mongoose = require("mongoose");

/* ---------- ObjectId validator ---------- */
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid MongoDB ObjectId");
  }
  return value;
}, "ObjectId Validation");

/* ---------- Student Validation ---------- */
const studentValidationSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .pattern(/^[A-Za-z ]+$/)
    .min(3)
    .max(100)
    .messages({
      "string.pattern.base": "Full name can contain only letters and spaces",
      "string.min": "Full name must be at least 3 characters",
      "string.max": "Full name must be at most 100 characters",
    })
    .optional(),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .messages({
      "string.email": "Email must be a valid email address",
    })
    .optional(),

  mobileNo: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .messages({
      "string.pattern.base":
        "Mobile number must be a valid 10-digit Indian number",
    })
    .optional(),

  dob: Joi.date()
    .messages({
      "date.base": "Date of birth must be a valid date",
    })
    .optional(),

  gender: Joi.string()
    .valid("male", "female", "other")
    .messages({
      "any.only": "Gender must be male, female, or other",
    })
    .optional(),

  selectedProgram: Joi.string()
    .valid(
      "Full Stack Web Development - 02-June-2025 Onwards (90 Days)",
      "Full Stack Mobile Development - 02-June-2025 Onwards (90 Days)"
    )
    .messages({
      "any.only": "Selected program is invalid",
    })
    .optional(),

  address: Joi.object({
    add1: Joi.string().optional(),
    add2: Joi.string().optional(),
    taluka: Joi.string().optional(),
    dist: Joi.string().optional(),
    state: Joi.string().optional(),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .messages({
        "string.pattern.base": "Pincode must be exactly 6 digits",
      })
      .optional(),
  }).optional(),

  currentEducation: Joi.string().optional(),

  status: Joi.string().optional(),

  boardUniversityCollege: Joi.string().optional(),

  branch: objectId.optional(),

  enrolledCourses: Joi.array()
    .items(objectId)
    .messages({
      "array.base": "Enrolled courses must be an array of course IDs",
    })
    .optional(),

  collegeName: Joi.string()
    .trim()
    .messages({
      "string.base": "College name must be a string",
    })
    .optional(),

  assignmentSubmissions: Joi.array()
    .items(objectId)
    .messages({
      "array.base": "Assignment submissions must be an array of IDs",
    })
    .optional(),

  coursesInterested: Joi.array()
    .items(objectId)
    .messages({
      "array.base": "Courses interested must be an array of IDs",
    })
    .optional(),

  preferredBatchTiming: Joi.string().optional(),

  preferredMode: Joi.string()
    .valid("online", "offline", "hybrid")
    .messages({
      "any.only": "Preferred mode must be online, offline, or hybrid",
    })
    .optional(),

  idProofStudent: Joi.string().optional(),

  profilePhotoStudent: Joi.string().allow("").optional(),

  password: Joi.string()
    .min(6)
    .messages({
      "string.min": "Password must be at least 6 characters",
    })
    .optional(),

  role: Joi.string()
    .valid("admin", "trainer", "student")
    .messages({
      "any.only": "Role must be admin, trainer, or student",
    })
    .optional(),

  isActive: Joi.boolean()
    .messages({
      "boolean.base": "isActive must be true or false",
    })
    .optional(),
});

module.exports = studentValidationSchema;
