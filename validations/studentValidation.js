const Joi = require("joi");

// Validation for Student (create/update)
const validateStudent = (data, isUpdate = false) => {
  const schema = Joi.object({
    fullName: Joi.string().trim().optional().messages({
      "string.base": "Full name must be a string.",
      "string.empty": "Full name cannot be empty.",
    }),

    email: Joi.string().email().optional().messages({
      "string.email": "Email must be a valid email address.",
      "string.empty": "Email cannot be empty.",
    }),

    mobileNo: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .optional()
      .messages({
        "string.pattern.base":
          "Mobile number must be 10 digits starting with 6-9.",
        "string.empty": "Mobile number cannot be empty.",
      }),

    dob: Joi.date().optional().messages({
      "date.base": "Date of birth must be a valid date.",
    }),

    gender: Joi.string().valid("Male", "Female", "Other").optional().messages({
      "any.only": "Gender must be 'Male', 'Female', or 'Other'.",
      "string.empty": "Gender cannot be empty.",
    }),

    selectedProgram: Joi.string()
      .valid(
        "Full Stack Web Development - 02-June-2025 Onwards (90 Days)",
        "Full Stack Mobile Development - 02-June-2025 Onwards (90 Days)"
      )
      .optional()
      .messages({
        "any.only": "Selected program must be a valid program option.",
        "string.empty": "Selected program cannot be empty.",
      }),

    address: Joi.object({
      add1: Joi.string().optional(),
      add2: Joi.string().optional(),
      taluka: Joi.string().optional(),
      dist: Joi.string().optional(),
      state: Joi.string().optional(),
      pincode: Joi.string()
        .pattern(/^\d{6}$/)
        .optional()
        .messages({
          "string.pattern.base": "Pincode must be 6 digits.",
        }),
    }).optional(),

    currentEducation: Joi.string().optional().messages({
      "string.base": "Current education must be a string.",
    }),

    status: Joi.string().optional().messages({
      "string.base": "Status must be a string.",
    }),

    boardUniversityCollege: Joi.string().optional().messages({
      "string.base": "Board/University/College must be a string.",
    }),

    branch: Joi.string().optional().messages({
      "string.base": "Branch ID must be a valid string ObjectId.",
    }),

    enrolledCourses: Joi.array().items(Joi.string()).optional().messages({
      "array.base": "Enrolled courses must be an array of course IDs.",
    }),

    coursesInterested: Joi.array().items(Joi.string()).optional().messages({
      "array.base": "Courses interested must be an array of course IDs.",
    }),

    preferredBatchTiming: Joi.string().optional().messages({
      "string.base": "Preferred batch timing must be a string.",
    }),

    preferredMode: Joi.string().optional().messages({
      "string.base": "Preferred mode must be a string.",
    }),

    idProofStudent: Joi.string().optional().messages({
      "string.base": "ID proof must be a string.",
    }),

    profilePhotoStudent: Joi.string().optional().messages({
      "string.base": "Profile photo must be a string URL/path.",
    }),

    password: Joi.string().optional().messages({
      "string.base": "Password must be a string.",
    }),

    role: Joi.string()
      .valid("admin", "trainer", "student")
      .optional()
      .messages({
        "any.only": "Role must be 'admin', 'trainer', or 'student'.",
      }),

    isActive: Joi.boolean().optional().messages({
      "boolean.base": "isActive must be true or false.",
    }),
  });

  return schema.validate(data, { abortEarly: true });
};

module.exports = { validateStudent };
