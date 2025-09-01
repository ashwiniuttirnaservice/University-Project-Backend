const Branch = require("../models/Branch.js");
const Course = require("../models/Course.js");

const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.getAllBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find({}).sort({ name: 1 });
  return sendResponse(res, 200, true, "Branches fetched", branches);
});

exports.getBranchById = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);
  if (!branch) {
    return sendError(res, 404, false, "Branch not found");
  }
  return sendResponse(res, 200, true, "Branch retrieved", branch);
});

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
