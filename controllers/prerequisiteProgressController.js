const mongoose = require("mongoose");
const Prerequisite = require("../models/Prerequisite");
const PrerequisiteProgress = require("../models/PrerequisiteProgress");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createOrGetProgress = asyncHandler(async (req, res) => {
  const { prerequisiteId, studentId } = req.body;

  if (!prerequisiteId || !studentId) {
    return sendError(res, 400, false, "prerequisiteId and studentId required");
  }

  if (
    !mongoose.Types.ObjectId.isValid(prerequisiteId) ||
    !mongoose.Types.ObjectId.isValid(studentId)
  ) {
    return sendError(res, 400, false, "Invalid ID");
  }

  // 🔹 check existing progress
  let progress = await PrerequisiteProgress.findOne({
    prerequisiteId,
    studentId,
  });

  if (progress) {
    return sendResponse(res, 200, true, "Progress fetched", progress);
  }

  // 🔹 fetch prerequisite content
  const prerequisite = await Prerequisite.findById(prerequisiteId);
  if (!prerequisite) {
    return sendError(res, 404, false, "Prerequisite not found");
  }

  // 🔹 create progress
  progress = await PrerequisiteProgress.create({
    prerequisiteId,
    studentId,
    courseId: prerequisite.courseId,
    batchId: prerequisite.batchId,
    topicsProgress: prerequisite.topics.map((t) => ({
      topicId: t._id,
      topicName: t.name,
    })),
  });

  return sendResponse(res, 201, true, "Progress created", progress);
});
exports.completeTopic = asyncHandler(async (req, res) => {
  const { prerequisiteId, studentId, topicId } = req.body;

  if (!prerequisiteId || !studentId || !topicId) {
    return sendError(res, 400, false, "All fields required");
  }

  const progress = await PrerequisiteProgress.findOne({
    prerequisiteId,
    studentId,
  });

  if (!progress) {
    return sendError(res, 404, false, "Progress not found");
  }

  const topic = progress.topicsProgress.find(
    (t) => t.topicId.toString() === topicId
  );

  if (!topic) {
    return sendError(res, 404, false, "Topic not found");
  }

  topic.isCompleted = true;
  topic.completedAt = new Date();

  // 🔹 check full completion
  const allDone = progress.topicsProgress.every((t) => t.isCompleted === true);

  if (allDone) {
    progress.isCompleted = true;
    progress.completedAt = new Date();
  }

  await progress.save();

  return sendResponse(res, 200, true, "Topic completed", progress);
});

exports.getStudentProgress = asyncHandler(async (req, res) => {
  const { prerequisiteId, studentId } = req.query;

  if (!prerequisiteId || !studentId) {
    return sendError(res, 400, false, "prerequisiteId and studentId required");
  }

  const progress = await PrerequisiteProgress.findOne({
    prerequisiteId,
    studentId,
  });

  if (!progress) {
    return sendError(res, 404, false, "Progress not found");
  }

  return sendResponse(res, 200, true, "Progress fetched", progress);
});
