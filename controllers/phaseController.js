const Phase = require("../models/Phase");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");

const Course = require("../models/Course");

exports.createPhase = asyncHandler(async (req, res) => {
  const phases = req.body;

  if (!Array.isArray(phases) || phases.length === 0) {
    return sendError(res, 400, false, "Provide an array of phases");
  }

  for (const p of phases) {
    if (!p.title || !p.course) {
      return sendError(
        res,
        400,
        false,
        "Each phase must have a title and course"
      );
    }
  }

  const createdPhases = await Phase.insertMany(phases);

  const coursePhaseMap = {};
  createdPhases.forEach((phase) => {
    if (!coursePhaseMap[phase.course]) coursePhaseMap[phase.course] = [];
    coursePhaseMap[phase.course].push(phase._id);
  });

  const updatePromises = Object.keys(coursePhaseMap).map((courseId) =>
    Course.findByIdAndUpdate(
      courseId,
      { $push: { phases: { $each: coursePhaseMap[courseId] } } },
      { new: true }
    )
  );
  await Promise.all(updatePromises);

  return sendResponse(
    res,
    201,
    true,
    "Phases created successfully and saved in their courses",
    createdPhases
  );
});

exports.getAllPhases = asyncHandler(async (req, res) => {
  const phases = await Phase.find().populate("course").populate("weeks");
  return sendResponse(
    res,
    200,
    true,
    "All phases fetched successfully",
    phases
  );
});

exports.getPhaseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Phase ID");
  }

  const phase = await Phase.findById(id).populate("course").populate("weeks");

  if (!phase) {
    return sendError(res, 404, false, "Phase not found");
  }

  return sendResponse(res, 200, true, "Phase fetched successfully", phase);
});

exports.updatePhase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, weeks } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Phase ID");
  }

  const phase = await Phase.findByIdAndUpdate(
    id,
    { title, description, weeks },
    { new: true, runValidators: true }
  );

  if (!phase) {
    return sendError(res, 404, false, "Phase not found");
  }

  return sendResponse(res, 200, true, "Phase updated successfully", phase);
});

exports.deletePhase = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Phase ID");
  }

  const phase = await Phase.findByIdAndDelete(id);

  if (!phase) {
    return sendError(res, 404, false, "Phase not found");
  }

  return sendResponse(res, 200, true, "Phase deleted successfully", null);
});
