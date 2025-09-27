const Chapter = require("../models/Chapter");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");
const Week = require("../models/Week");

exports.createChapter = asyncHandler(async (req, res) => {
  const chapters = req.body;

  if (!Array.isArray(chapters) || chapters.length === 0) {
    return sendError(res, 400, false, "Chapters array is required");
  }

  const createdChapters = await Chapter.insertMany(chapters);

  for (let c of createdChapters) {
    await Week.findByIdAndUpdate(c.week, { $push: { chapters: c._id } });
  }

  return sendResponse(
    res,
    201,
    true,
    "Chapters created successfully",
    createdChapters
  );
});

exports.getAllChapters = asyncHandler(async (req, res) => {
  const chapters = await Chapter.find()
    .populate("week")
    .populate("lectures")
    .populate("assignments");
  return sendResponse(
    res,
    200,
    true,
    "All chapters fetched successfully",
    chapters
  );
});

exports.getChapterById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Chapter ID");
  }

  const chapter = await Chapter.findById(id)
    .populate("week")
    .populate("lectures")
    .populate("assignments");

  if (!chapter) {
    return sendError(res, 404, false, "Chapter not found");
  }

  return sendResponse(res, 200, true, "Chapter fetched successfully", chapter);
});

exports.updateChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { week, title, points, lectures, assignments } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Chapter ID");
  }

  const chapter = await Chapter.findByIdAndUpdate(
    id,
    { week, title, points, lectures, assignments },
    { new: true, runValidators: true }
  );

  if (!chapter) {
    return sendError(res, 404, false, "Chapter not found");
  }

  return sendResponse(res, 200, true, "Chapter updated successfully", chapter);
});

exports.deleteChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Chapter ID");
  }

  const chapter = await Chapter.findByIdAndDelete(id);

  if (!chapter) {
    return sendError(res, 404, false, "Chapter not found");
  }

  return sendResponse(res, 200, true, "Chapter deleted successfully", null);
});
