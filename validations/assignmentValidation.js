const Joi = require("joi");

const validateAssignment = (data) => {
  const submissionSchema = Joi.object({
    student: Joi.string().required().messages({
      "any.required": '"student" is required',
      "string.empty": '"student" cannot be empty',
    }),
    files: Joi.array().items(Joi.string()).min(1).messages({
      "array.min": '"files" must contain at least 1 file',
    }),
    mistakePhotos: Joi.array().items(Joi.string()).messages({
      "array.base": '"mistakePhotos" must be an array of strings',
    }),
    remarks: Joi.string().allow("").optional(),
    status: Joi.string()
      .valid("submitted", "pending", "reviewed")
      .default("submitted")
      .messages({
        "any.only": '"status" must be one of submitted, pending, reviewed',
      }),
    score: Joi.number().min(0).default(0).messages({
      "number.base": '"score" must be a number',
      "number.min": '"score" cannot be negative',
    }),
    submittedAt: Joi.date().optional(),
  });

  const schema = Joi.object({
    course: Joi.string().required().messages({
      "any.required": "course is required.",
      "string.empty": "course cannot be empty.",
    }),
    chapter: Joi.string().required().messages({
      "any.required": "chapter is required.",
      "string.empty": "chapter cannot be empty.",
    }),

    title: Joi.alternatives()
      .try(Joi.string().trim().min(1), Joi.number())
      .required()
      .messages({
        "any.required": '"title" is required',
        "string.empty": '"title" cannot be empty',
        "alternatives.types": '"title" must be a string or a number',
      }),

    description: Joi.string().allow("").optional(),
    fileUrl: Joi.string().allow("").optional(),
    deadline: Joi.date().required().messages({
      "any.required": '"deadline" is required',
      "date.base": '"deadline" must be a valid date',
    }),
    submissions: Joi.array().items(submissionSchema).messages({
      "array.base": '"submissions" must be an array',
    }),
    status: Joi.string()
      .valid("active", "inactive")
      .default("active")
      .messages({
        "any.only": '"status" must be active or inactive',
      }),
    isActive: Joi.boolean().default(true),
  });

  return schema.validate(data, { abortEarly: true });
};

module.exports = { validateAssignment };
