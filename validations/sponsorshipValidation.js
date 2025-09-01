const Joi = require("joi");
const mongoose = require("mongoose");

const sponsorshipSchema = Joi.object({
  sponsorName: Joi.string().trim().optional(),

  sponsorType: Joi.string()
    .valid("Platinum", "Gold", "Silver", "Bronze", "Community", "Other")
    .required(),

  logo: Joi.string().uri().optional(),

  website: Joi.string().uri().optional(),

  contactPerson: Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Contact person name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Valid email is required",
      "any.required": "Contact person email is required",
    }),
    phone: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .optional(),
  }).required(),

  contribution: Joi.object({
    amount: Joi.number().min(0).default(0),
    inKind: Joi.string().optional(),
  }).optional(),

  benefits: Joi.array().items(Joi.string()).optional(),

  agreementSigned: Joi.boolean().default(false),

  hackathon: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation")
    .optional(),

  sessionCategory: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation")
    .optional(),

  projectName: Joi.string().required().messages({
    "string.empty": "Project name is required",
  }),

  description: Joi.string().allow("").optional(),

  technologies: Joi.array().items(Joi.string()).optional(),

  startDate: Joi.date().required().messages({
    "date.base": "Start date must be a valid date",
    "any.required": "Start date is required",
  }),

  endDate: Joi.date().greater(Joi.ref("startDate")).optional().messages({
    "date.greater": "End date must be after start date",
  }),

  status: Joi.string().valid("Pending", "Approved", "Rejected").optional(),

  isActive: Joi.boolean().default(true),
});

const validateSponsorship = (data) => {
  return sponsorshipSchema.validate(data, { abortEarly: true });
};

module.exports = { validateSponsorship };
