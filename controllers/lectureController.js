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

  if (!chapter || !mongoose.Types.ObjectId.isValid(chapter)) {
    return sendError(res, 400, false, "Valid chapter ID is required");
  }

  let contentUrl = null;
  if (req.file) {
    contentUrl = `${req.file.filename}`;
  } else if (req.body.contentUrl) {
    contentUrl = req.body.contentUrl;
  }

  const lecturesData = [
    {
      course,
      chapter,
      type,
      title,
      duration,
      description,
      contentUrl,
      batches: batches ? (Array.isArray(batches) ? batches : [batches]) : [],
      status: status || "pending",
    },
  ];

  const createdLectures = await Lecture.insertMany(lecturesData);

  await Chapter.findByIdAndUpdate(chapter, {
    $push: { lectures: { $each: createdLectures.map((lec) => lec._id) } },
  });

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

  // Trainer असल्यास batch.trainer मधे शोधायचे
  if (req.user.role === "trainer") {
    filter.batches = {
      $in: await Batch.find({
        trainer: req.user.trainerId,
      }).distinct("_id"),
    };
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

  const lectures = await Lecture.find({ course: courseId })
    .populate("course")
    .populate("chapter")
    .populate("batches");

  if (!lectures.length)
    return sendError(res, 404, false, "No lectures found for this course");

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

  if (!lecture) return sendError(res, 404, false, "Lecture not found");

  return sendResponse(res, 200, true, "Lecture fetched", lecture);
});

exports.updateLecture = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid lecture ID");
  }

  const updateData = { ...req.body };
  if (req.file) updateData.contentUrl = path.basename(req.file.path);

  const lecture = await Lecture.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!lecture) return sendError(res, 404, false, "Lecture not found");

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

  await lecture.deleteOne();

  return sendResponse(res, 200, true, "Lecture deleted successfully");
});
