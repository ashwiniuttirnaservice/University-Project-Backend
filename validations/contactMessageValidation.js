const Joi = require("joi");

const contactMessageSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "Name must be a string",
    "any.required": "Name is required",
  }),

  email: Joi.string().trim().lowercase().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 to 15 digits",
      "any.required": "Phone number is required",
    }),

  message: Joi.string().trim().required().messages({
    "any.required": "Message is required",
  }),
});

const validateContactMessage = (data) => {
  return contactMessageSchema.validate(data, { abortEarly: true });
};

module.exports = validateContactMessage;
