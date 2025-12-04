const Prerequisite = require("../models/Prerequisite");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");
exports.createPrerequisite = asyncHandler(async (req, res) => {
  const { courseId, batchId, title, description, topics } = req.body;

  if (!courseId || !batchId || !title) {
    return sendError(
      res,
      400,
      false,
      "courseId, batchId and title are required"
    );
  }

  let parsedTopics = [];
  try {
    parsedTopics = topics ? JSON.parse(topics) : [];
  } catch {
    return sendError(res, 400, false, "Invalid topics JSON format");
  }

  const uploadedFiles = [];
  if (req.files) {
    if (Array.isArray(req.files)) uploadedFiles.push(...req.files);
    else Object.values(req.files).forEach((arr) => uploadedFiles.push(...arr));
  }

  const finalTopics = parsedTopics.map((topic) => {
    const filesForTopic = topic.materialFiles.map((fileName) => {
      const file = uploadedFiles.find((f) => f.originalname === fileName);
      return file ? file.filename : fileName;
    });
    return { ...topic, materialFiles: filesForTopic };
  });

  const prerequisite = await Prerequisite.create({
    courseId,
    batchId,
    title,
    description,
    topics: finalTopics,
  });

  return sendResponse(
    res,
    201,
    true,
    "Prerequisite created successfully",
    prerequisite
  );
});

exports.getAllPrerequisites = asyncHandler(async (req, res) => {
  const prerequisites = await Prerequisite.find({ isActive: true }).sort({
    createdAt: -1,
  });

  return sendResponse(
    res,
    200,
    true,
    "All prerequisites fetched successfully",
    prerequisites
  );
});

exports.getPrerequisiteById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid prerequisite ID");
  }

  const prerequisite = await Prerequisite.findById(id);

  if (!prerequisite) {
    return sendError(res, 404, false, "Prerequisite not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Prerequisite fetched successfully",
    prerequisite
  );
});

exports.updatePrerequisite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { courseId, batchId, title, description, topics } = req.body;

  if (!id) {
    return sendError(res, 400, false, "Prerequisite ID is required");
  }

  const existing = await Prerequisite.findById(id);
  if (!existing) {
    return sendError(res, 404, false, "Prerequisite not found");
  }

  let parsedTopics = [];
  try {
    parsedTopics = topics ? JSON.parse(topics) : [];
  } catch {
    return sendError(res, 400, false, "Invalid topics JSON format");
  }

  const uploadedFiles = [];
  if (req.files) {
    if (Array.isArray(req.files)) uploadedFiles.push(...req.files);
    else Object.values(req.files).forEach((arr) => uploadedFiles.push(...arr));
  }

  let fileIndex = 0;
  const finalTopics = parsedTopics.map((topic) => {
    const filesForTopic = topic.materialFiles
      .map(() => {
        const file = uploadedFiles[fileIndex++];
        return file ? file.filename : null;
      })
      .filter(Boolean);
    return { ...topic, materialFiles: filesForTopic };
  });

  existing.courseId = courseId || existing.courseId;
  existing.batchId = batchId || existing.batchId;
  existing.title = title || existing.title;
  existing.description = description || existing.description;
  if (finalTopics.length > 0) existing.topics = finalTopics;

  await existing.save();

  return sendResponse(
    res,
    200,
    true,
    "Prerequisite updated successfully",
    existing
  );
});

exports.softDeletePrerequisite = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid prerequisite ID");
  }

  const prerequisite = await Prerequisite.findById(id);
  if (!prerequisite) {
    return sendError(res, 404, false, "Prerequisite not found");
  }

  prerequisite.isActive = false;
  await prerequisite.save();

  return sendResponse(
    res,
    200,
    true,
    "Prerequisite deleted successfully",
    prerequisite
  );
});
