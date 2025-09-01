const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message(`"${value}" is not a valid ObjectId`);
  }
  return value;
};

const courseSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Course title is required",
  }),

  description: Joi.string().required().messages({
    "any.required": "Description is required",
  }),

  duration: Joi.string().required().messages({
    "any.required": "Duration is required",
  }),

  branch: Joi.string().custom(objectId, "ObjectId validation").optional(),

  rating: Joi.number().min(0).max(5).default(4.9),

  enrolledCount: Joi.number().min(0).default(1200),

  overview: Joi.string().required().messages({
    "any.required": "Overview is required",
  }),

  learningOutcomes: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      "any.required": "At least one learning outcome is required",
    }),

  benefits: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      "any.required": "At least one benefit is required",
    }),

  keyFeatures: Joi.array().items(
    Joi.object({
      title: Joi.string().required().messages({
        "any.required": "Key feature title is required",
      }),
      description: Joi.string().allow("").optional(),
      subPoints: Joi.array().items(Joi.string()).optional(),
    })
  ),

  features: Joi.object({
    certificate: Joi.boolean().default(true),
    codingExercises: Joi.boolean().default(true),
    recordedLectures: Joi.boolean().default(true),
  }).optional(),

  videolectures: Joi.array().items(
    Joi.string().custom(objectId, "ObjectId validation")
  ),

  notes: Joi.array().items(
    Joi.string().custom(objectId, "ObjectId validation")
  ),

  isActive: Joi.boolean().default(true),
});

const validateCourse = (data) => {
  return courseSchema.validate(data, { abortEarly: true });
};

module.exports = validateCourse;
