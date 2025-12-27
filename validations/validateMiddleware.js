const { sendError } = require("../utils/apiResponse");

const validateRequest = (validator) => {
  return (req, res, next) => {
    const { error, value } = validator(req.body, {
      abortEarly: true,
      stripUnknown: true,
    });

    if (error) {
      return sendError(res, 400, false, error.details[0].message);
    }

    req.body = value;
    next();
  };
};

module.exports = validateRequest;
