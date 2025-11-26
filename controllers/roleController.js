const Role = require("../models/role");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createRole = asyncHandler(async (req, res) => {
  const { role, permissions } = req.body;

  if (!role) return sendError(res, "Role name is required", 400);

  const existing = await Role.findOne({ role });
  if (existing) return sendError(res, "Role already exists", 400);

  const newRole = await Role.create({ role, permissions });

  return sendResponse(res, 201, "Role created successfully", newRole);
});

exports.getAllRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find();
  return sendResponse(res, 200, "All roles fetched successfully", roles);
});

exports.getRoleById = asyncHandler(async (req, res) => {
  const roleData = await Role.findById(req.params.id);

  if (!roleData) return sendError(res, "Role not found", 404);

  return sendResponse(res, 200, "Role fetched successfully", roleData);
});

exports.updateRole = asyncHandler(async (req, res) => {
  const { role, permissions } = req.body;

  const updated = await Role.findByIdAndUpdate(
    req.params.id,
    { role, permissions },
    { new: true }
  );

  if (!updated) return sendError(res, 404, false, "Role not found");

  return sendResponse(res, 200, true, "Role updated successfully", updated);
});

exports.deleteRole = asyncHandler(async (req, res) => {
  const deleted = await Role.findByIdAndDelete(req.params.id);

  if (!deleted) return sendError(res, "Role not found", 404);

  return sendResponse(res, 200, "Role deleted successfully", deleted);
});
