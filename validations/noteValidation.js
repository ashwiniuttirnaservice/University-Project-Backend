const Joi = require("joi");
const mongoose = require("mongoose");

const noteSchema = Joi.object({
  course: Joi.string()
    .custom((value, helper) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helper.message("Invalid course ID");
      }
      return value;
    })
    .required(),

  title: Joi.string().min(3).max(100).required(),
  content: Joi.string().allow("", null),
  file: Joi.string().uri().allow("", null),

  duration: Joi.string()
    .pattern(/^([0-9]{2}:[0-9]{2}:[0-9]{2}|[0-9]{2}:[0-9]{2})$/)
    .message("Duration must be in format HH:MM:SS or MM:SS")
    .allow("", null),

  uploadedAt: Joi.date().default(Date.now),
});

const validateNote = (data) => {
  return noteSchema.validate(data, { abortEarly: true });
};

module.exports = { validateNote };
