const Module = require("../models/Module");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createModules = asyncHandler(async (req, res) => {
  const { modules } = req.body;
  if (!modules || !Array.isArray(modules) || modules.length === 0) {
    return sendError(
      res,
      400,
      false,
      "Modules array is required in request body"
    );
  }

  const createdModules = [];
  for (const moduleName of modules) {
    const existing = await Module.findOne({ module: moduleName });
    if (!existing) {
      const newModule = await Module.create({ module: moduleName });
      createdModules.push(newModule);
    }
  }

  return sendResponse(
    res,
    201,
    true,
    `${createdModules.length} modules created successfully`,
    createdModules
  );
});

exports.getAllModules = asyncHandler(async (req, res) => {
  const modules = await Module.find({ isActive: true });
  return sendResponse(res, 200, true, "Modules fetched", modules);
});

exports.getModuleById = asyncHandler(async (req, res) => {
  const module = await Module.findById(req.params.id);
  if (!module) return sendError(res, 404, false, "Module not found");
  return sendResponse(res, 200, true, "Module fetched", module);
});

exports.updateModule = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const module = await Module.findById(req.params.id);
  if (!module) return sendError(res, 404, false, "Module not found");

  module.name = name || module.name;
  await module.save();

  return sendResponse(res, 200, true, "Module updated", module);
});

exports.deleteModule = asyncHandler(async (req, res) => {
  const module = await Module.findById(req.params.id);
  if (!module) return sendError(res, 404, false, "Module not found");

  module.isActive = false;
  await module.save();

  return sendResponse(res, 200, true, "Module soft-deleted", module);
});
