const Joi = require("joi");

const hackathonSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),

  theme: Joi.string().trim().max(200).optional(),

  description: Joi.string().trim().max(2000).optional(),

  startDate: Joi.date().required(),

  endDate: Joi.date().required().greater(Joi.ref("startDate")).messages({
    "date.greater": "End date must be after start date",
  }),

  venue: Joi.string().trim().optional(),

  mode: Joi.string().valid("Online", "Offline", "Hybrid").default("Offline"),

  eligibility: Joi.string().default("College Students"),

  maxTeamSize: Joi.number().min(1).max(20).default(4),

  minTeamSize: Joi.number()
    .min(1)
    .max(Joi.ref("maxTeamSize"))
    .default(1)
    .messages({
      "number.max": "Min team size cannot be greater than max team size",
    }),

  registrationDeadline: Joi.date().optional(),

  teams: Joi.array().items(
    Joi.object({
      teamName: Joi.string().trim().required(),

      members: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().trim().required(),
            email: Joi.string().email().trim().required(),
            phone: Joi.string()
              .pattern(/^[6-9]\d{9}$/)
              .optional()
              .messages({
                "string.pattern.base":
                  "Phone must be a valid 10-digit Indian number",
              }),
            college: Joi.string().trim().required(),
            year: Joi.string().trim().optional(),
            branch: Joi.string().trim().optional(),
          })
        )
        .min(1)
        .max(Joi.ref("...maxTeamSize"))
        .required(),

      projectIdea: Joi.string().trim().optional(),
      githubRepo: Joi.string().uri().optional(),

      status: Joi.string()
        .valid("Registered", "Shortlisted", "Submitted", "Evaluated")
        .default("Registered"),
    })
  ),

  judges: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().required(),
      designation: Joi.string().trim().optional(),
      organization: Joi.string().trim().optional(),
      email: Joi.string().email().trim().optional(),
    })
  ),

  sponsorships: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),

  prizes: Joi.array().items(
    Joi.object({
      position: Joi.string().trim().required(),
      reward: Joi.string().trim().required(),
    })
  ),

  rules: Joi.array().items(Joi.string().trim()),

  isActive: Joi.boolean().default(true),
});

const validateHackathon = (data) => {
  return hackathonSchema.validate(data, { abortEarly: false });
};

module.exports = { validateHackathon };
