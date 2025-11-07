const Week = require("../models/Week");
const Phase = require("../models/Phase");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");

exports.createWeek = asyncHandler(async (req, res) => {
  const weeks = req.body;

  if (!Array.isArray(weeks) || weeks.length === 0) {
    return sendError(res, 400, false, "Weeks array is required");
  }

  const createdWeeks = await Week.insertMany(weeks);

  for (let w of createdWeeks) {
    await Phase.findByIdAndUpdate(w.phase, { $push: { weeks: w._id } });
  }

  return sendResponse(
    res,
    201,
    true,
    "Weeks created successfully",
    createdWeeks
  );
});

exports.getAllWeeks = asyncHandler(async (req, res) => {
  const weeks = await Week.find().populate("phase").populate("chapters");
  return sendResponse(res, 200, true, "All weeks fetched successfully", weeks);
});

exports.getWeeksByCourseId = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const weeks = await Week.find()
    .populate({
      path: "phase",
      match: { course: courseId },
      populate: { path: "course", model: "Course" },
    })
    .populate("chapters");

  const filteredWeeks = weeks.filter((week) => week.phase !== null);

  if (filteredWeeks.length === 0) {
    return sendError(res, 404, "No weeks found for this course");
  }

  return sendResponse(
    res,
    200,
    true,
    "Weeks fetched successfully for the given course",
    filteredWeeks
  );
});

exports.getWeekById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Week ID");
  }

  const week = await Week.findById(id).populate("phase").populate("chapters");

  if (!week) {
    return sendError(res, 404, false, "Week not found");
  }

  return sendResponse(res, 200, true, "Week fetched successfully", week);
});

exports.updateWeek = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { phase, weekNumber, title, chapters } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Week ID");
  }

  const week = await Week.findByIdAndUpdate(
    id,
    { phase, weekNumber, title, chapters },
    { new: true, runValidators: true }
  );

  if (!week) {
    return sendError(res, 404, false, "Week not found");
  }

  return sendResponse(res, 200, true, "Week updated successfully", week);
});

exports.deleteWeek = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Week ID");
  }

  const week = await Week.findById(id);
  if (!week) {
    return sendError(res, 404, false, "Week not found");
  }

  week.isActive = false;
  await week.save();

  return sendResponse(res, 200, true, "Week deactivated successfully", week);
});
