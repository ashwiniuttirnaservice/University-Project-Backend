const Lecture = require("../models/Lecture");
const Chapter = require("../models/Chapter");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");

const path = require("path");

exports.createMultipleLectures = asyncHandler(async (req, res) => {
  const { chapter, title, duration, description } = req.body;

  if (!chapter || !mongoose.Types.ObjectId.isValid(chapter)) {
    return sendError(res, 400, false, "Valid chapter ID is required");
  }

  if (!req.files || req.files.length === 0) {
    return sendError(res, 400, false, "At least one lecture file is required");
  }

  const titlesArr = Array.isArray(title) ? title : [title];
  const durationsArr = Array.isArray(duration) ? duration : [duration];
  const descriptionsArr = Array.isArray(description)
    ? description
    : [description];

  const lecturesData = req.files.map((file, index) => {
    const filename = path.basename(file.path);

    return {
      chapter,
      title: titlesArr[index] || `Lecture ${index + 1}`,
      duration: durationsArr[index] || "",
      description: descriptionsArr[index] || "",
      contentUrl: filename,
    };
  });

  const createdLectures = await Lecture.insertMany(lecturesData);

  await Chapter.findByIdAndUpdate(chapter, {
    $push: { lectures: { $each: createdLectures.map((lec) => lec._id) } },
  });

  return sendResponse(
    res,
    201,
    true,
    "Lectures created successfully and linked to chapter",
    createdLectures
  );
});

exports.getAllLectures = asyncHandler(async (req, res) => {
  const lectures = await Lecture.find().populate("chapter");
  return sendResponse(res, 200, true, "All lectures fetched", lectures);
});

exports.getLectureById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid lecture ID");
  }

  const lecture = await Lecture.findById(id).populate("chapter");
  if (!lecture) return sendError(res, 404, false, "Lecture not found");

  return sendResponse(res, 200, true, "Lecture fetched", lecture);
});

exports.updateLecture = asyncHandler(async (req, res) => {
  const { title, duration, description, status } = req.body;
  const updateData = { title, duration, description, status };

  if (req.file) updateData.contentUrl = req.file.path;

  const lecture = await Lecture.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!lecture) return sendError(res, 404, false, "Lecture not found");

  return sendResponse(res, 200, true, "Lecture updated", lecture);
});

exports.deleteLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findByIdAndDelete(req.params.id);
  if (!lecture) return sendError(res, 404, false, "Lecture not found");

  return sendResponse(res, 200, true, "Lecture deleted", null);
});
