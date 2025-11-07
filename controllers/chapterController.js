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
    .populate("assignments")
    .populate("notes");

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
    .populate("assignments")
    .populate("notes");

  if (!chapter) {
    return sendError(res, 404, false, "Chapter not found");
  }

  return sendResponse(res, 200, true, "Chapter fetched successfully", chapter);
});

exports.getChaptersByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const chapters = await Chapter.find()
    .populate({
      path: "week",
      populate: {
        path: "phase",
        populate: { path: "course", model: "Course" },
      },
    })
    .populate("lectures")
    .populate("assignments")
    .populate("notes");

  const filteredChapters = chapters.filter(
    (ch) =>
      ch.week &&
      ch.week.phase &&
      ch.week.phase.course &&
      ch.week.phase.course._id.toString() === courseId
  );

  if (!filteredChapters.length) {
    return sendError(res, 404, "No chapters found for this course");
  }

  return sendResponse(
    res,
    200,
    true,
    "Chapters fetched successfully for the given course",
    filteredChapters
  );
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

  const chapter = await Chapter.findById(id);
  if (!chapter) {
    return sendError(res, 404, false, "Chapter not found");
  }

  chapter.isActive = false;
  await chapter.save();

  return sendResponse(
    res,
    200,
    true,
    "Chapter deactivated successfully",
    chapter
  );
});
