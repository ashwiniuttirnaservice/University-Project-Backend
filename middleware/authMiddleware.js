const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler.js");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1️⃣ Read token from cookie
  token = req.cookies?.jwt;

  // 2️⃣ Read token from Authorization header
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
    } catch (error) {
      console.error("Bearer token parse error:", error);
      res.status(401);
      throw new Error("Not authorized, token format galat hai");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  try {
    // 3️⃣ Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Attach user info from token directly (no DB call)
    req.user = {
      studentId: decoded.studentId || null,
      courseId: decoded.courseId || null,
      role: decoded.role || null,
    };

    if (!req.user.studentId || !req.user.role) {
      res.status(401);
      throw new Error("Not authorized, invalid token payload");
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401);
    throw new Error("Not authorized, token fail ho gaya");
  }
});

// ✅ Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user nahi mila");
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `User role '${req.user.role}' is not authorized for this route`
      );
    }

    next();
  };
};

// ✅ Admin shortcut
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as admin");
  }
};

module.exports = { protect, authorize, admin };
