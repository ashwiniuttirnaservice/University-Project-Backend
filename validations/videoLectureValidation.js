const Joi = require("joi");

const videoLectureSchema = Joi.object({
  course: Joi.string().required().messages({
    "string.base": "Course ID must be a string",
    "any.required": "Course ID is required",
  }),

  type: Joi.string().valid("video", "lecture").required().messages({
    "any.only": "Type must be either 'video' or 'lecture'",
    "any.required": "Type is required",
  }),

  title: Joi.string().trim().required().messages({
    "string.empty": "Title cannot be empty",
    "any.required": "Title is required",
  }),

  contentUrl: Joi.string().uri().trim().optional().messages({
    "string.uri": "Content URL must be a valid URI",
  }),

  duration: Joi.string().trim().optional(),

  description: Joi.string().trim().optional(),
});

const videoLectureValidation = (data) => {
  return videoLectureSchema.validate(data, { abortEarly: true });
};

module.exports = { videoLectureValidation };
