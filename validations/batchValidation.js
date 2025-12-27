const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message(`"${value}" is not a valid ObjectId`);
  }
  return value;
};

const batchSchema = Joi.object({
  batchName: Joi.string().trim().required().messages({
    "string.base": "Batch name must be a string",
    "any.required": "Batch name is required",
  }),

  timing: Joi.string().required().messages({
    "any.required": "Timing is required",
  }),

  mode: Joi.string().required().messages({
    "any.required": "Mode is required",
  }),

  coursesAssigned: Joi.array().items(
    Joi.string().custom(objectId, "ObjectId validation")
  ),

  trainersAssigned: Joi.array().items(
    Joi.string().custom(objectId, "ObjectId validation")
  ),

  additionalNotes: Joi.string().allow("").optional(),

  students: Joi.array().items(
    Joi.object({
      studentId: Joi.string()
        .custom(objectId, "ObjectId validation")
        .required(),
      fullName: Joi.string().required(),
      email: Joi.string().email().required(),
    })
  ),

  studentCount: Joi.number().min(0).default(0),
});

const validateBatch = (data) => {
  return batchSchema.validate(data, { abortEarly: true });
};

module.exports = validateBatch;
