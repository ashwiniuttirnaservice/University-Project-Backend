const mongoose = require("mongoose");
const Joi = require("joi");

const internshipSessionSchemaJoi = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().allow(""),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  duration: Joi.string().required(),
  mode: Joi.string().valid("Online", "Offline", "Hybrid").default("Online"),
  location: Joi.string().trim().when("mode", {
    is: "Offline",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  topics: Joi.array().items(Joi.string().trim()),

  capacity: Joi.string().required(),
  fees: Joi.object({
    amount: Joi.number().min(0).default(0),
    currency: Joi.string().default("INR"),
    refundPolicy: Joi.string().trim().allow(""),
  }),
  certification: Joi.boolean().default(false),
  status: Joi.string()
    .valid("Upcoming", "Ongoing", "Completed", "Cancelled")
    .default("Upcoming"),
});

const validateInternshipSession = (data) => {
  return internshipSessionSchemaJoi.validate(data, { abortEarly: true });
};

module.exports = {
  validateInternshipSession,
};
