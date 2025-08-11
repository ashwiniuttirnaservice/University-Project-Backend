const Branch = require("../models/Branch.js");
const Course = require("../models/Course.js");

const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// @desc    Get all branches
// @route   GET /api/branches
// @access  Public
exports.getAllBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find({}).sort({ name: 1 });
  return sendResponse(res, 200, true, "Branches fetched", branches);
});

// @desc    Get a single branch by ID
// @route   GET /api/branches/:id
// @access  Public
exports.getBranchById = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) {
    return sendError(res, 404, false, "Branch not found");
  }
  return sendResponse(res, 200, true, "Branch retrieved", branch);
});

// @desc    Create a new branch
// @route   POST /api/branches
// @access  Private/Admin
exports.createBranch = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return sendError(res, 400, false, "Branch name is required");
  }

  const existingBranch = await Branch.findOne({ name });
  if (existingBranch) {
    return sendError(res, 400, false, "Branch with this name already exists");
  }

  const branch = await Branch.create({ name, description });
  return sendResponse(res, 201, true, "Branch created", branch);
});

// @desc    Update a branch
// @route   PUT /api/branches/:id
// @access  Private/Admin
exports.updateBranch = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  let branch = await Branch.findById(req.params.id);
  if (!branch) {
    return sendError(res, 404, false, "Branch not found");
  }

  if (name && name !== branch.name) {
    const existingBranch = await Branch.findOne({ name });
    if (existingBranch) {
      return sendError(
        res,
        400,
        false,
        "Another branch with this name already exists"
      );
    }
  }

  branch.name = name || branch.name;
  branch.description =
    description !== undefined ? description : branch.description;

  const updatedBranch = await branch.save();
  return sendResponse(res, 200, true, "Branch updated", updatedBranch);
});

// @desc    Delete a branch
// @route   DELETE /api/branches/:id
// @access  Private/Admin
exports.deleteBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) {
    return sendError(res, 404, false, "Branch not found");
  }

  const coursesInBranch = await Course.countDocuments({
    branch: req.params.id,
  });
  if (coursesInBranch > 0) {
    return sendError(
      res,
      400,
      false,
      `Cannot delete branch. ${coursesInBranch} courses are associated with it. Please reassign or delete them first.`
    );
  }

  await branch.deleteOne();
  return sendResponse(res, 200, true, "Branch deleted successfully");
});
