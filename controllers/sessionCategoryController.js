const SessionCategory = require("../models/SessionCategory");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createSessionCategory = asyncHandler(async (req, res) => {
  const sessionCategory = new SessionCategory(req.body);
  await sessionCategory.save();
  return sendResponse(
    res,
    201,
    true,
    "Session category created successfully",
    sessionCategory
  );
});

exports.getAllSessionCategories = asyncHandler(async (req, res) => {
  const categories = await SessionCategory.find().sort({ createdAt: -1 });
  return sendResponse(
    res,
    200,
    true,
    "Session categories fetched successfully",
    categories
  );
});

exports.getSessionCategoryById = asyncHandler(async (req, res) => {
  const category = await SessionCategory.findById(req.params.id);
  if (!category) {
    return sendError(res, 404, false, "Category not found");
  }
  return sendResponse(
    res,
    200,
    true,
    "Session category fetched successfully",
    category
  );
});

exports.updateSessionCategory = asyncHandler(async (req, res) => {
  const category = await SessionCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!category) {
    return sendError(res, 404, false, "Category not found");
  }
  return sendResponse(
    res,
    200,
    true,
    "Session category updated successfully",
    category
  );
});

exports.deleteSessionCategory = asyncHandler(async (req, res) => {
  const category = await SessionCategory.findByIdAndDelete(req.params.id);
  if (!category) {
    return sendError(res, 404, false, "Category not found");
  }
  return sendResponse(res, 200, true, "Session category deleted successfully");
});
