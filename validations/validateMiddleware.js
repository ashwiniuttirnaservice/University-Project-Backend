const { sendError } = require("../utils/apiResponse");

const validateRequest = (validator) => {
  return (req, res, next) => {
    const { error } = validator(req.body);
    if (error) {
      return sendError(res, 400, false, error.details[0].message);
    }
    next();
  };
};

module.exports = validateRequest;
