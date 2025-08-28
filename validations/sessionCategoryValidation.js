const Joi = require("joi");

const sessionCategorySchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is mandatory",
  }),

  slug: Joi.string().trim().required().messages({
    "string.empty": "Slug is required",
    "any.required": "Slug is mandatory",
  }),

  desc: Joi.string().trim().allow("", null),

  type: Joi.string().trim().required().messages({
    "string.empty": "Type is required",
    "any.required": "Type is mandatory",
  }),

  isActive: Joi.boolean().default(true),
});

const validateSessionCategory = (data) => {
  return sessionCategorySchema.validate(data, { abortEarly: true });
};

module.exports = { validateSessionCategory };
