const Joi = require("joi");

const webinarSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().allow(""),
  date: Joi.date().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().allow(""),
  speakerName: Joi.string().trim().required(),
  speakerBio: Joi.string().trim().allow(""),
  speakerPhoto: Joi.string().uri().allow(""),
  platform: Joi.string().required(),
  meetingLink: Joi.string().uri().required(),
  meetingId: Joi.string().allow(""),
  passcode: Joi.string().allow(""),
  registrationRequired: Joi.boolean().default(true),
  maxParticipants: Joi.number().integer().positive(),
  tags: Joi.array().items(Joi.string().trim()),
  status: Joi.string(),
  createdBy: Joi.string().hex().length(24).optional(),
});

const webinarValidation = (data) => {
  return webinarSchema.validate(data, { abortEarly: true });
};

module.exports = { webinarValidation };
