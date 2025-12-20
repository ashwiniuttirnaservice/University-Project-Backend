const mongoose = require("mongoose");
const path = require("path");
const Batch = require("../models/Batch");
const Lecture = require("../models/Lecture");
const Chapter = require("../models/Chapter");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
exports.createMultipleLectures = asyncHandler(async (req, res) => {
  const {
    course,
    chapter,
    type,
    title,
    duration,
    description,
    batches,
    status,
  } = req.body;

  let contentUrl = null;
  if (req.file) {
    contentUrl = req.file.filename;
  } else if (req.body.contentUrl) {
    contentUrl = req.body.contentUrl;
  }

  const batchArray = batches
    ? Array.isArray(batches)
      ? batches
      : [batches]
    : [];

  const lecturesData = [
    {
      course,
      chapter:
        chapter && mongoose.Types.ObjectId.isValid(chapter) ? chapter : null,
      type,
      title,
      duration,
      description,
      contentUrl,
      batches: batchArray,
      status: status || "pending",
    },
  ];

  const createdLectures = await Lecture.insertMany(lecturesData);

  // ✅ update chapter only if valid
  if (chapter && mongoose.Types.ObjectId.isValid(chapter)) {
    await Chapter.findByIdAndUpdate(chapter, {
      $push: { lectures: { $each: createdLectures.map((l) => l._id) } },
    });
  }

  // ✅ update batches
  if (batchArray.length > 0) {
    await Batch.updateMany(
      { _id: { $in: batchArray } },
      { $push: { lectures: { $each: createdLectures.map((l) => l._id) } } }
    );
  }

  return sendResponse(
    res,
    201,
    true,
    "Lecture created successfully",
    createdLectures
  );
});

exports.getAllLectures = asyncHandler(async (req, res) => {
  const filter = { isActive: true };

  if (req.user.role === "trainer") {
    const trainerBatches = await Batch.find({
      trainer: req.user.trainerId,
    }).distinct("_id");

    filter.batches = { $in: trainerBatches };
  }

  const lectures = await Lecture.find(filter)
    .populate("course")
    .populate("chapter")
    .populate("batches")
    .sort({ createdAt: -1 });

  return sendResponse(res, 200, true, "All lectures fetched", lectures);
});

exports.getLecturesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return sendError(res, 400, false, "Invalid course ID");
  }

  const lectures = await Lecture.find({
    course: courseId,
    isActive: true,
  })
    .populate("course")
    .populate("chapter")
    .populate("batches");

  if (!lectures.length) {
    return sendError(res, 404, false, "No lectures found for this course");
  }

  return sendResponse(res, 200, true, "Lectures fetched by course", lectures);
});

exports.getLectureById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid lecture ID");
  }

  const lecture = await Lecture.findById(id)
    .populate("course")
    .populate("chapter")
    .populate("batches");

  if (!lecture) {
    return sendError(res, 404, false, "Lecture not found");
  }

  return sendResponse(res, 200, true, "Lecture fetched", lecture);
});

exports.updateLecture = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid lecture ID");
  }

  const updateData = { ...req.body };

  // ✅ chapter optional handling
  if (req.body.chapter === undefined) {
    delete updateData.chapter;
  } else if (
    req.body.chapter !== null &&
    !mongoose.Types.ObjectId.isValid(req.body.chapter)
  ) {
    return sendError(res, 400, false, "Invalid chapter ID");
  }

  if (req.file) {
    updateData.contentUrl = req.file.filename;
  }

  const lecture = await Lecture.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!lecture) {
    return sendError(res, 404, false, "Lecture not found");
  }

  return sendResponse(res, 200, true, "Lecture updated successfully", lecture);
});

exports.deleteLecture = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Lecture ID");
  }

  const lecture = await Lecture.findById(id);
  if (!lecture) {
    return sendError(res, 404, false, "Lecture not found");
  }

  lecture.isActive = false;
  await lecture.save();

  return sendResponse(res, 200, true, "Lecture deleted successfully");
});

exports.cloneLecture = asyncHandler(async (req, res) => {
  const { lectureId } = req.body;

  if (!lectureId || !mongoose.Types.ObjectId.isValid(lectureId)) {
    return sendError(res, 400, false, "Valid lectureId is required");
  }

  const originalLecture = await Lecture.findById(lectureId);

  if (!originalLecture) {
    return sendError(res, 404, false, "Lecture not found");
  }

  const clonedLecture = await Lecture.create({
    course: originalLecture.course,
    chapter: originalLecture.chapter || null,
    title: originalLecture.title + " (Copy)",
    description: originalLecture.description,
    contentUrl: originalLecture.contentUrl,
    duration: originalLecture.duration,
    type: originalLecture.type,
    batches: originalLecture.batches,
    status: originalLecture.status,
    isActive: true,
  });

  // ✅ update chapter only if exists
  if (originalLecture.chapter) {
    await Chapter.findByIdAndUpdate(originalLecture.chapter, {
      $push: { lectures: clonedLecture._id },
    });
  }

  return sendResponse(
    res,
    201,
    true,
    "Lecture cloned successfully",
    clonedLecture
  );
});
