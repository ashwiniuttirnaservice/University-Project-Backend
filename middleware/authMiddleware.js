const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const { sendError } = require("../utils/apiResponse");

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.jwt;

  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return sendError(res, 401, false, "Not authorized, token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id || null,
      role: decoded.role || null,
    };

    if (!req.user.role) {
      return sendError(res, 401, false, "User role missing in token");
    }

    next();
  } catch (err) {
    return sendError(res, 401, false, "Token invalid or expired");
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, false, "Not authorized, no user found");
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        false,
        `User role '${req.user.role}' is not allowed`
      );
    }

    next();
  };
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return sendError(res, 401, false, "Not authorized as admin");
};

module.exports = { protect, authorize, admin };
