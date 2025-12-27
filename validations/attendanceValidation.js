const Joi = require("joi");

const validateAttendance = (data) => {
  const attendeeSchema = Joi.object({
    student: Joi.string().trim().required().messages({
      "any.required": "Student ID is required.",
      "string.base": "Student ID must be a valid string.",
      "string.empty": "Student ID cannot be empty.",
    }),

    batch: Joi.string().trim().required().messages({
      "any.required": "Batch ID inside attendees is required.",
      "string.base": "Batch ID must be a valid string.",
      "string.empty": "Batch ID cannot be empty.",
    }),

    present: Joi.boolean().default(false).messages({
      "boolean.base": "Present must be true or false.",
    }),
  });

  const schema = Joi.object({
    meeting: Joi.string().trim().required().messages({
      "any.required": "Meeting ID is required.",
      "string.base": "Meeting ID must be a valid string ObjectId.",
      "string.empty": "Meeting ID cannot be empty.",
    }),

    batch: Joi.string().trim().required().messages({
      "any.required": "Batch ID is required.",
      "string.base": "Batch ID must be a valid string ObjectId.",
      "string.empty": "Batch ID cannot be empty.",
    }),

    trainer: Joi.string().trim().required().messages({
      "any.required": "Trainer ID is required.",
      "string.base": "Trainer ID must be a valid string ObjectId.",
      "string.empty": "Trainer ID cannot be empty.",
    }),

    course: Joi.string().trim().allow(null, "").optional().messages({
      "string.base": "Course ID must be a valid string ObjectId.",
    }),

    attendees: Joi.array().items(attendeeSchema).min(1).required().messages({
      "any.required": "Attendees list is required.",
      "array.base": "Attendees must be an array.",
      "array.min": "At least one attendee record is required.",
    }),

    markedByTrainer: Joi.boolean().default(false).messages({
      "boolean.base": "markedByTrainer must be true or false.",
    }),

    markedAt: Joi.date().optional().messages({
      "date.base": "markedAt must be a valid date.",
    }),

    isActive: Joi.boolean().default(true).messages({
      "boolean.base": "isActive must be true or false.",
    }),
  });

  return schema.validate(data, {
    abortEarly: true,
  });
};

module.exports = { validateAttendance };
