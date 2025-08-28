const Joi = require("joi");

const feedbackSchema = Joi.object({
  courseId: Joi.string().optional(),
  fullName: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 3 characters",
    "string.max": "Full name must be at most 100 characters",
  }),
  mobileNo: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.empty": "Mobile number is required",
      "string.pattern.base":
        "Mobile number must be valid (10 digits starting with 6-9)",
    }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be valid",
  }),
  collegeName: Joi.string().allow("").max(200).messages({
    "string.max": "College name must be at most 200 characters",
  }),
  message: Joi.string().max(1000).required().messages({
    "string.empty": "Message is required",
    "string.max": "Message must not exceed 1000 characters",
  }),
  profile: Joi.string().allow("").optional(),
  rating: Joi.string().messages({
    "any.only": "Rating must be between 1 and 5",
    "string.empty": "Rating is required",
  }),
});

const validateFeedback = (data) => {
  return feedbackSchema.validate(data, { abortEarly: true });
};

module.exports = { validateFeedback };
