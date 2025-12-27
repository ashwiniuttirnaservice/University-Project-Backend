const Role = require("../models/role");
const { sendError } = require("../utils/apiResponse");

const checkAccess = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return sendError(res, 401, false, "Unauthorized: No role provided");
      }

      if (userRole === "admin") return next();

      const roleDoc = await Role.findOne({ role: userRole });

      if (!roleDoc) {
        return sendError(res, 403, false, "Role does not exist");
      }

      const moduleRecord = roleDoc.permissions.find(
        (p) => p.module.toLowerCase() === moduleName.toLowerCase()
      );

      if (!moduleRecord) {
        return sendError(res, 403, false, "No access to this module");
      }

      if (!moduleRecord.actions.includes(action)) {
        return sendError(res, 403, false, "Action not permitted");
      }

      next();
    } catch (error) {
      return sendError(res, 500, false, "Internal Server Error");
    }
  };
};

module.exports = checkAccess;
