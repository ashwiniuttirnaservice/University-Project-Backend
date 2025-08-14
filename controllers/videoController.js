const mongoose = require("mongoose");
const VideoLecture = require("../models/Video");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// Create Video Lecture
exports.createVideoLecture = asyncHandler(async (req, res) => {
  const { course, type, title, contentUrl, duration, description } = req.body;

  if (!course || !type || !title) {
    return sendError(res, "course, type, and title are required", 400);
  }

  const videoLecture = await VideoLecture.create({
    course,
    type,
    title,
    contentUrl,
    duration,
    description,
  });

  return sendResponse(
    res,
    "Video Lecture created successfully",
    videoLecture,
    201
  );
});

// Get All Video Lectures (Aggregation)
exports.getAllVideoLectures = asyncHandler(async (req, res) => {
  const lectures = await VideoLecture.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
    { $sort: { createdAt: -1 } },
  ]);

  return sendResponse(res, "All Video Lectures fetched", lectures);
});

// Get Video Lecture by ID (Aggregation)
exports.getVideoLectureById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, "Invalid Video Lecture ID", 400);
  }

  const lecture = await VideoLecture.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
  ]);

  if (!lecture.length) {
    return sendError(res, "Video Lecture not found", 404);
  }

  return sendResponse(res, "Video Lecture fetched successfully", lecture[0]);
});

// Update Video Lecture
exports.updateVideoLecture = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, "Invalid Video Lecture ID", 400);
  }

  const updatedLecture = await VideoLecture.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!updatedLecture) {
    return sendError(res, "Video Lecture not found", 404);
  }

  return sendResponse(
    res,
    "Video Lecture updated successfully",
    updatedLecture
  );
});

// Delete Video Lecture
exports.deleteVideoLecture = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, "Invalid Video Lecture ID", 400);
  }

  const deletedLecture = await VideoLecture.findByIdAndDelete(id);

  if (!deletedLecture) {
    return sendError(res, "Video Lecture not found", 404);
  }

  return sendResponse(res, "Video Lecture deleted successfully");
});
