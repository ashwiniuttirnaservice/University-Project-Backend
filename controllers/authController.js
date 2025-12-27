const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Branch = require("../models/Branch");
const User = require("../models/User");
const Trainer = require("../models/Trainer");
const Student = require("../models/Student");
const mongoose = require("mongoose");
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
  const { firstName, lastName, email, password, mobileNo, role } = req.body;

  if (!firstName || !lastName || !email || !password || !role) {
    return sendError(res, 400, false, "Please provide all required fields.");
  }

  if (role === "trainer") {
    if (!mobileNo) {
      return sendError(
        res,
        400,
        false,
        "Mobile number is required for trainer."
      );
    }

    const existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) {
      return sendError(res, 400, false, "Trainer already exists.");
    }

    const trainer = new Trainer({
      fullName: `${firstName} ${lastName}`,
      email,
      password,
      mobileNo,
      role: "trainer",

      dob: "NA",
      gender: "Other",
      address: { add1: "NA" },
      highestQualification: "NA",
      totalExperience: "0",
      resume: "NA",
      availableTiming: "NA",

      approvalStatus: "pending",
      isApproved: false,
    });

    await trainer.save();

    return sendResponse(
      res,
      201,
      true,
      "Trainer registration successful!",
      trainer
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 400, false, "User already exists.");
  }

  const user = new User({
    firstName,
    lastName,
    email,
    password,
    mobileNo,
    role,
  });

  await user.save();

  return sendResponse(res, 201, true, `${role} registration successful!`, user);
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

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, role, newPassword } = req.body;

  if (!email || !role || !newPassword) {
    return sendError(
      res,
      400,
      false,
      "Email, role and new password are required"
    );
  }

  let account;

  if (role === "trainer") {
    account = await Trainer.findOne({ email });

    if (!account) {
      return sendError(res, 404, false, "Trainer not found");
    }

    account.password = await newPassword;

    await account.save();

    return sendResponse(res, 200, true, "Trainer password reset successful");
  }

  account = await User.findOne({ email, role });

  if (!account) {
    return sendError(res, 404, false, "User not found");
  }

  account.password = await newPassword;

  await account.save();

  return sendResponse(res, 200, true, `${role} password reset successful`);
});

exports.logout = asyncHandler(async (req, res) => {
  const { _id, role } = req.body;

  if (!_id || !role) {
    return sendError(res, 400, false, "_id and role are required");
  }

  const Model = role === "trainer" ? Trainer : User;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return sendError(res, 400, false, "Invalid ID");
  }

  const account = await Model.findById(_id);
  if (!account) {
    return sendError(res, 404, false, "Account not found");
  }

  account.isLogin = !account.isLogin;
  await account.save();

  return sendResponse(
    res,
    200,
    true,
    account.isLogin ? "Login successful" : "Logout successful",
    { isLogin: account.isLogin }
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
      "+password +isLogin"
    );

    if (!admin || admin.password !== password) {
      return sendError(res, 401, false, "Invalid email or password for admin.");
    }

    if (!admin.isLogin) {
      return sendError(
        res,
        403,
        false,
        "This admin currently does not have permission to log in."
      );
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
    const trainer = await Trainer.findOne({ email }).select(
      "+password +isLogin"
    );

    if (!trainer || trainer.password !== password) {
      return sendError(
        res,
        401,
        false,
        "Invalid email or password for trainer."
      );
    }

    if (!trainer.isLogin) {
      return sendError(
        res,
        403,
        false,
        "This trainer currently does not have permission to log in."
      );
    }

    const token = generateToken(trainer._id, "trainer");

    const nameParts = trainer.fullName.split(" ");

    return sendResponse(res, 200, true, "Trainer login successful", {
      token,
      user: {
        _id: trainer._id,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" "),
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

    const nameParts = student.fullName.split(" ");

    return sendResponse(res, 200, true, "Student login successful", {
      token,
      user: {
        _id: student._id,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" "),
        email: student.email,
        role: "student",
      },
    });
  }

  const user = await User.findOne({ email, role }).select("+password +isLogin");

  if (!user || user.password !== password) {
    return sendError(res, 401, false, `Invalid email or password for ${role}.`);
  }

  if (!user.isLogin) {
    return sendError(
      res,
      403,
      false,
      `This ${role} currently does not have permission to log in.`
    );
  }

  const token = generateToken(user._id, role);

  return sendResponse(res, 200, true, `${role} login successful`, {
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
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

  user.password = password;

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
