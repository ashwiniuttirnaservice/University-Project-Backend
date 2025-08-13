const User = require("../models/User.js");
const Branch = require("../models/Branch.js");
const Enrollment = require("../models/Enrollment.js");

const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// @desc    Get all users (Admin) using aggregation
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.aggregate([
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        password: 0,
        "branchDetails.description": 0,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return sendResponse(res, 200, true, "Users fetched successfully", users);
});

// @desc    Get a single user by ID (Admin) using aggregation
exports.getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const users = await User.aggregate([
    { $match: { _id: new require("mongoose").Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
    { $project: { password: 0 } },
  ]);

  if (!users || users.length === 0)
    return sendError(res, 404, false, "User not found");

  const enrollments = await Enrollment.aggregate([
    { $match: { user: new require("mongoose").Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
    {
      $project: {
        course: "$courseDetails.title",
        status: 1,
        completedContent: 1,
        createdAt: 1,
      },
    },
  ]);

  return sendResponse(res, 200, true, "User data retrieved", {
    user: users[0],
    enrollments,
  });
});

// @desc    Update a user's details (Admin)
exports.updateUserByAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, role, branchId, isActiveNow } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 404, false, "User not found");

  if (user.email === "admin@example.com" && role && role !== "admin") {
    return sendError(
      res,
      400,
      false,
      "Cannot change the role of the primary admin account."
    );
  }

  if (req.user.id === req.params.id && role && role !== req.user.role) {
    return sendError(
      res,
      400,
      false,
      "Admin cannot change their own role via this endpoint."
    );
  }

  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return sendError(
        res,
        400,
        false,
        "Email already in use by another account."
      );
    }
    user.email = email;
  }

  if (role && ["student", "admin"].includes(role)) {
    user.role = role;
  } else if (role) {
    return sendError(res, 400, false, "Invalid role specified.");
  }

  if (branchId) {
    const branch = await Branch.findById(branchId);
    if (!branch) return sendError(res, 400, false, "Invalid Branch ID");
    user.branch = branchId;
  } else if (branchId === null || branchId === "") {
    user.branch = null;
  }

  if (typeof isActiveNow === "boolean") user.isActiveNow = isActiveNow;

  user.updatedAt = Date.now();
  const updatedUser = await user.save({ validateBeforeSave: true });

  const populatedUser = await User.findById(updatedUser._id)
    .populate("branch", "name")
    .select("-password");

  return sendResponse(
    res,
    200,
    true,
    "User updated successfully",
    populatedUser
  );
});

// @desc    Delete a user (Admin)
exports.deleteUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 404, false, "User not found");

  if (user.email === "admin@example.com") {
    return sendError(
      res,
      400,
      false,
      "Cannot delete the primary admin account."
    );
  }

  if (req.user.id === req.params.id) {
    return sendError(
      res,
      400,
      false,
      "Admin cannot delete their own account via this endpoint."
    );
  }

  await Enrollment.deleteMany({ user: req.params.id });
  await user.deleteOne();

  return sendResponse(
    res,
    200,
    true,
    "User and their enrollments deleted successfully"
  );
});
