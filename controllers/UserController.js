const User = require("../models/User.js");
const Course = require("../models/Course.js");
const Branch = require("../models/Branch.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const { sendResponse, sendError } = require("../utils/apiResponse.js");
const Student = require("../models/Student.js");
const Trainer = require("../models/Trainer");
const Batch = require("../models/Batch");
const Enrollment = require("../models/Enrollment");
const mongoose = require("mongoose");

const getUserProfile = asyncHandler(async (req, res) => {
  const studentId = req.user.studentId;

  const student = await Student.findById(studentId)
    .populate("branch", "name")
    .lean();
  if (!student) return sendError(res, 404, false, "User not found");

  const enrollment = await Enrollment.findOne({ studentId })
    .populate("enrolledCourses", "title duration")
    .populate("coursesInterested", "title duration")
    .lean();

  // Map batch info into enrolledCourses
  const enrolledCoursesWithBatch = [];
  if (enrollment?.enrolledCourses?.length) {
    for (const course of enrollment.enrolledCourses) {
      // Find the batch where this student is assigned for this course
      const batch = await Batch.findOne({
        students: { $elemMatch: { studentId } },
        coursesAssigned: course._id,
      })
        .select(
          "batchName time days mode status startDate endDate studentCount"
        )
        .lean();

      enrolledCoursesWithBatch.push({
        ...course,
        batch: batch || null,
      });
    }
  }

  return sendResponse(res, 200, true, "User profile fetched successfully", {
    _id: student._id,
    fullName: student.fullName,
    email: student.email,
    mobileNo: student.mobileNo,
    role: req.user.role,
    branch: student.branch || null,
    selectedProgram: student.selectedProgram || null,
    enrolledCourses: enrolledCoursesWithBatch,
    coursesInterested: enrollment?.coursesInterested || [],
    profilePhotoStudent: student.profilePhotoStudent || "",
    registeredAt: student.registeredAt,
    createdAt: student.createdAt,
  });
});

module.exports = { getUserProfile };

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
    batches: formattedBatches,
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  return sendResponse(res, 200, true, "All users fetched successfully", users);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    return sendResponse(res, 200, true, "User fetched successfully", user);
  } else {
    return sendError(res, 404, false, "User not found");
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid User ID");
  }

  const user = await User.findById(id);
  if (!user) {
    return sendError(res, 404, false, "User not found");
  }

  user.isActive = false;
  await user.save();

  return sendResponse(res, 200, true, "User deactivated successfully", user);
});

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
