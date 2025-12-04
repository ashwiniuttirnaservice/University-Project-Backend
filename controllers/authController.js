const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Branch = require("../models/Branch");
const User = require("../models/User");
const Trainer = require("../models/Trainer");
const Student = require("../models/Student");

const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return sendError(res, 400, false, "Please provide all required fields.");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return sendError(res, 400, false, "User already exists.");
  }

  const user = new User({
    firstName,
    lastName,
    email,
    password,
    role: "admin",
  });

  await user.save();

  return sendResponse(res, 201, true, "Admin registration successful!", user);
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return sendError(res, 400, false, "Verification token not provided.");
  }

  const user = await User.findOne({ emailVerificationToken: token });
  if (!user) {
    return sendError(res, 400, false, "Invalid or expired verification token.");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  return sendResponse(
    res,
    200,
    true,
    "Email verified successfully! You can now log in.",
    user
  );
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return sendError(
      res,
      400,
      false,
      "Email, password, and role are required."
    );
  }

  if (role === "admin") {
    const admin = await User.findOne({ email, role: "admin" }).select(
      "+password"
    );
    if (!admin || admin.password !== password) {
      return sendError(res, 401, false, "Invalid email or password for admin.");
    }

    const token = generateToken(admin._id, admin.role);
    return sendResponse(res, 200, true, "Admin login successful", {
      token,
      user: {
        _id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
      },
    });
  }

  if (role === "trainer") {
    const trainer = await Trainer.findOne({ email }).select("+password");
    if (!trainer || trainer.password !== password) {
      return sendError(
        res,
        401,
        false,
        "Invalid email or password for trainer."
      );
    }

    const token = generateToken(trainer._id, "trainer");
    return sendResponse(res, 200, true, "Trainer login successful", {
      token,
      user: {
        _id: trainer._id,
        firstName: trainer.fullName.split(" ")[0],
        lastName: trainer.fullName.split(" ").slice(1).join(" "),
        email: trainer.email,
        role: "trainer",
      },
    });
  }

  if (role === "student") {
    const student = await Student.findOne({ email }).select("+password");
    if (!student || student.password !== password) {
      return sendError(
        res,
        401,
        false,
        "Invalid email or password for student."
      );
    }

    const token = generateToken(student._id, "student");
    return sendResponse(res, 200, true, "Student login successful", {
      token,
      user: {
        _id: student._id,
        firstName: student.fullName.split(" ")[0],
        lastName: student.fullName.split(" ").slice(1).join(" "),
        email: student.email,
        role: "student",
      },
    });
  }

  return sendError(res, 400, false, "Invalid role specified.");
});

exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate(
    "branch",
    "name description"
  );
  if (!user) {
    return sendError(res, 404, false, "User not found");
  }

  return sendResponse(res, 200, true, "User profile fetched", { user });
});

exports.updateUserProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, branchId, password } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    return sendError(res, 404, false, "User not found");
  }

  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;

  if (branchId) {
    const branchExists = await Branch.findById(branchId);
    if (!branchExists) {
      return sendError(res, 400, false, "Invalid Branch ID");
    }
    user.branch = branchId;
  } else if (branchId === null || branchId === "") {
    user.branch = null;
  }

  if (password && password.length >= 6) {
    user.password = password;
  } else if (password && password.length < 6) {
    return sendError(res, 400, false, "Password must be at least 6 characters");
  }

  await user.save();
  const updatedUser = await User.findById(user._id).populate("branch", "name");

  return sendResponse(res, 200, true, "User profile updated", {
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    role: updatedUser.role,
    branch: updatedUser.branch,
  });
});
