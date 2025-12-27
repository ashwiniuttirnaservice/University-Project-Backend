import Joi from "joi";

export const trainerValidationSchema = Joi.object({
  fullName: Joi.string().trim().required().messages({
    "string.empty": "Full name is required.",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Please enter a valid email address.",
  }),

  mobileNo: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Enter valid 10-digit Indian mobile number.",
      "any.required": "Mobile number is required.",
    }),

  dob: Joi.date().required().messages({
    "date.base": "Date of birth must be a valid date.",
    "any.required": "Date of birth is required.",
  }),

  gender: Joi.string().valid("Male", "Female", "Other").required().messages({
    "any.only": "Gender must be Male, Female, or Other.",
    "any.required": "Gender is required.",
  }),

  address: Joi.object({
    add1: Joi.string().required().messages({
      "string.empty": "Address Line 1 is required.",
    }),
    add2: Joi.string().allow("", null),
    taluka: Joi.string().allow("", null),
    dist: Joi.string().allow("", null),
    state: Joi.string().allow("", null),
    pincode: Joi.string()
      .pattern(/^\d{6}$/)
      .allow("", null)
      .messages({
        "string.pattern.base": "Pincode must be 6 digits.",
      }),
  })
    .required()
    .messages({
      "any.required": "Address is required.",
    }),

  highestQualification: Joi.string().required().messages({
    "string.empty": "Highest qualification is required.",
  }),

  specializations: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.base": "Specializations must be an array.",
    "array.min": "At least one specialization is required.",
    "any.required": "Specializations are required.",
  }),

  collegeName: Joi.string().required().messages({
    "string.empty": "College name is required.",
  }),

  totalExperience: Joi.string().required().messages({
    "string.empty": "Total experience is required.",
  }),

  subjectExperience: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      "array.base": "Subject experience must be an array.",
      "array.min": "At least one subject is required.",
      "any.required": "Subject experience is required.",
    }),

  availableTiming: Joi.object({
    workingDays: Joi.array().items(Joi.string()).required().messages({
      "array.base": "Working days must be an array.",
    }),
    weeklyOff: Joi.array().items(Joi.string()).required().messages({
      "array.base": "Weekly off must be an array.",
    }),
    custom: Joi.string().allow("", null),
  })
    .required()
    .messages({
      "any.required": "Available timing is required.",
    }),

  password: Joi.string().min(4).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 4 characters.",
  }),

  linkedinProfile: Joi.string().uri().allow("", null).messages({
    "string.uri": "Enter a valid LinkedIn profile URL.",
  }),
});
