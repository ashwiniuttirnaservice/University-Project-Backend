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
  } catch (err) {
    return sendError(res, 400, false, "Invalid topics JSON format");
  }

  const uploadedFiles = req.files?.materialFiles
    ? req.files.materialFiles.map((file) => file.filename)
    : [];

  const finalTopics = parsedTopics.map((topic, index) => ({
    ...topic,
    videoLinks: Array.isArray(topic.videoLinks)
      ? topic.videoLinks[0]
      : topic.videoLinks,
    materialFiles: uploadedFiles[index] || "",
  }));

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
  const prerequisites = await Prerequisite.find({ isActive: true })
    .populate("courseId")
    .populate("batchId")
    .sort({ createdAt: -1 });

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

  const prerequisite = await Prerequisite.findById(id)
    .populate("courseId")
    .populate("batchId");

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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid prerequisite ID");
  }

  const { courseId, batchId, title, description, topics } = req.body;

  let parsedTopics = [];
  try {
    parsedTopics = topics ? JSON.parse(topics) : [];
  } catch (error) {
    return sendError(res, 400, false, "Invalid topics JSON format");
  }

  const uploadedFiles = req.files?.materialFiles
    ? req.files.materialFiles.map((file) => file.filename)
    : [];

  const finalTopics = parsedTopics.map((topic, index) => ({
    ...topic,
    videoLinks: Array.isArray(topic.videoLinks)
      ? topic.videoLinks[0]
      : topic.videoLinks,
    materialFiles: uploadedFiles[index] || topic.materialFiles || "",
  }));

  const updated = await Prerequisite.findByIdAndUpdate(
    id,
    { courseId, batchId, title, description, topics: finalTopics },
    { new: true }
  );

  if (!updated) {
    return sendError(res, 404, false, "Prerequisite not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Prerequisite updated successfully",
    updated
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
