const mongoose = require("mongoose");
const VideoLecture = require("../models/Video");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createVideoLecture = asyncHandler(async (req, res) => {
  const { course, type, title, contentUrl, duration, description } = req.body;

  if (!course || !type || !title) {
    return sendError(res, 400, false, "course, type, and title are required");
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
    201,
    true,
    "Video Lecture created successfully",
    videoLecture
  );
});

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

  return sendResponse(res, 200, true, "All Video Lectures fetched", lectures);
});

exports.getVideoLectureById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Video Lecture ID");
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
    return sendError(res, 404, false, "Video Lecture not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Video Lecture fetched successfully",
    lecture[0]
  );
});

exports.updateVideoLecture = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Video Lecture ID");
  }

  const updatedLecture = await VideoLecture.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedLecture) {
    return sendError(res, 404, false, "Video Lecture not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Video Lecture updated successfully",
    updatedLecture
  );
});

exports.deleteVideoLecture = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Video Lecture ID");
  }

  const deletedLecture = await VideoLecture.findByIdAndDelete(id);

  if (!deletedLecture) {
    return sendError(res, 404, false, "Video Lecture not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Video Lecture deleted successfully",
    null
  );
});
