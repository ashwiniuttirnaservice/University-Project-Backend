const User = require("../models/User.js");
const Course = require("../models/Course.js");
const Branch = require("../models/Branch.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const { sendResponse, sendError } = require("../utils/apiResponse.js");
const Student = require("../models/Student");
const Trainer = require("../models/Trainer");
const Batch = require("../models/Batch");
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return sendError(res, 404, false, "User not found");
  }

  let studentData = null;

  // If role is student, fetch from Student model
  if (user.role === "student") {
    studentData = await Student.findOne({ email: user.email })
      .populate("branch", "name")
      .populate("enrolledCourses", "title imageUrl");

    if (!studentData) {
      return sendError(res, 404, false, "Student data not found");
    }
  }

  return sendResponse(res, 200, true, "User profile fetched successfully", {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    branch: studentData?.branch || null,
    enrolledCourses: studentData?.enrolledCourses || [],
    studentId: studentData?._id || null,
    createdAt: user.createdAt,
  });
});

const getUserProfileTrainer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return sendError(res, 404, false, "User not found");
  }

  if (user.role !== "trainer") {
    return sendError(
      res,
      403,
      false,
      "Only trainers have profiles with batches and courses."
    );
  }

  const trainer = await Trainer.findOne({ email: user.email });

  if (!trainer) {
    return sendError(res, 404, false, "Trainer data not found");
  }

  const assignedBatches = await Batch.find({ trainersAssigned: trainer._id })
    .populate("coursesAssigned", "title description imageUrl")
    .lean();

  const formattedBatches = assignedBatches.map((batch) => ({
    _id: batch._id,
    batchName: batch.batchName,
    timing: batch.timing,
    mode: batch.mode,
    courses: batch.coursesAssigned,
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
  }));

  return sendResponse(res, 200, true, "Trainer profile fetched successfully", {
    _id: user._id,
    trainerId: trainer._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    registeredAt: trainer.registeredAt,
    batches: formattedBatches, // batches with populated course info
  });
});

// @desc    Get all users by Admin
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  return sendResponse(res, 200, true, "All users fetched successfully", users);
});

// @desc    Get user by ID by Admin
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    return sendResponse(res, 200, true, "User fetched successfully", user);
  } else {
    return sendError(res, 404, false, "User not found");
  }
});

// @desc    Delete user by Admin
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    return sendResponse(res, 200, true, "User removed successfully");
  } else {
    return sendError(res, 404, false, "User not found");
  }
});

// @desc    Update user by Admin
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.isEmailVerified = req.body.isEmailVerified ?? user.isEmailVerified;

    const updatedUser = await user.save();

    return sendResponse(res, 200, true, "User updated successfully", {
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      isEmailVerified: updatedUser.isEmailVerified,
    });
  } else {
    return sendError(res, 404, false, "User not found");
  }
});

module.exports = {
  getUserProfile,
  getUserProfileTrainer,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
};
