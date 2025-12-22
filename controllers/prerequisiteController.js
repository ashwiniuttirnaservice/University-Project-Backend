const Prerequisite = require("../models/Prerequisite");
const Batch = require("../models/Batch");
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

  /* -------- Parse topics -------- */
  let parsedTopics = [];
  try {
    parsedTopics = topics ? JSON.parse(topics) : [];
  } catch {
    return sendError(res, 400, false, "Invalid topics JSON format");
  }

  /* -------- Collect uploaded files -------- */
  const uploadedFiles = [];
  if (req.files) {
    if (Array.isArray(req.files)) uploadedFiles.push(...req.files);
    else Object.values(req.files).forEach((arr) => uploadedFiles.push(...arr));
  }

  /* -------- Map files (ORIGINAL + SAVED NAME SUPPORT) -------- */
  const finalTopics = parsedTopics.map((topic) => {
    const filesForTopic = (topic.materialFiles || []).map((fileName) => {
      const file = uploadedFiles.find(
        (f) =>
          f.originalname === fileName || // new upload
          f.filename === fileName // already saved file
      );

      return file ? file.filename : fileName;
    });

    return {
      ...topic,
      materialFiles: filesForTopic,
    };
  });

  /* -------- Create prerequisite -------- */
  const prerequisite = await Prerequisite.create({
    courseId,
    batchId,
    title,
    description,
    topics: finalTopics,
  });

  /* -------- Attach to batch -------- */
  await Batch.findByIdAndUpdate(
    batchId,
    { $push: { prerequisites: prerequisite._id } },
    { new: true }
  );

  return sendResponse(
    res,
    201,
    true,
    "Prerequisite created successfully",
    prerequisite
  );
});

exports.getAllPrerequisites = asyncHandler(async (req, res) => {
  const filter = { isActive: true };

  // 🔥 Trainer role filtering
  if (req.user.role === "trainer") {
    const trainerBatchIds = await Batch.find({
      trainer: req.user.trainerId,
    }).distinct("_id");

    filter.batchId = { $in: trainerBatchIds };
  }

  const prerequisites = await Prerequisite.find(filter).sort({
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

  if (!courseId || !batchId || !title) {
    return sendError(
      res,
      400,
      false,
      "courseId, batchId and title are required"
    );
  }

  const prerequisite = await Prerequisite.findById(id);
  if (!prerequisite) {
    return sendError(res, 404, false, "Prerequisite not found");
  }

  /* -------- Parse topics -------- */
  let parsedTopics = [];
  try {
    parsedTopics = topics ? JSON.parse(topics) : [];
  } catch {
    return sendError(res, 400, false, "Invalid topics JSON format");
  }

  /* -------- Collect uploaded files -------- */
  const uploadedFiles = [];
  if (req.files) {
    if (Array.isArray(req.files)) uploadedFiles.push(...req.files);
    else Object.values(req.files).forEach((arr) => uploadedFiles.push(...arr));
  }

  /* -------- Map files (ORIGINAL + SAVED NAME SUPPORT) -------- */
  const finalTopics = parsedTopics.map((topic) => {
    const filesForTopic = (topic.materialFiles || []).map((fileName) => {
      const file = uploadedFiles.find(
        (f) =>
          f.originalname === fileName || // new upload
          f.filename === fileName // already saved file
      );

      return file ? file.filename : fileName;
    });

    return {
      ...topic,
      materialFiles: filesForTopic,
    };
  });

  /* -------- Update prerequisite -------- */
  const updatedPrerequisite = await Prerequisite.findByIdAndUpdate(
    id,
    {
      courseId,
      batchId,
      title,
      description,
      topics: finalTopics,
    },
    { new: true, runValidators: true }
  );

  return sendResponse(
    res,
    200,
    true,
    "Prerequisite updated successfully",
    updatedPrerequisite
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

exports.clonePrerequisite = asyncHandler(async (req, res) => {
  const { prerequisiteId } = req.body;

  if (!prerequisiteId) {
    return sendError(res, 400, false, "prerequisiteId is required");
  }

  const originalPrerequisite = await Prerequisite.findById(prerequisiteId);

  if (!originalPrerequisite) {
    return sendError(res, 404, false, "Prerequisite not found");
  }

  // Clone topics according to schema
  const clonedTopics = originalPrerequisite.topics.map((topic) => ({
    name: topic.name, // REQUIRED
    videoLinks: topic.videoLinks || "",
    materialFiles: [...(topic.materialFiles || [])],
  }));

  const clonedPrerequisite = await Prerequisite.create({
    courseId: originalPrerequisite.courseId,
    batchId: originalPrerequisite.batchId,
    title: originalPrerequisite.title + " (Copy)",
    description: originalPrerequisite.description,
    topics: clonedTopics,
  });

  return sendResponse(
    res,
    201,
    true,
    "Prerequisite cloned successfully",
    clonedPrerequisite
  );
});
