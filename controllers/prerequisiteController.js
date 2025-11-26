const Prerequisite = require("../models/Prerequisite");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createPrerequisite = asyncHandler(async (req, res) => {
  const { courseId, title, description, videoLinks, topics, type } = req.body;

  if (!courseId || !title) {
    return sendError(res, 400, false, "courseId and title are required");
  }

  let materialFiles = [];

  if (req.files && req.files.materialFiles) {
    materialFiles = req.files.materialFiles.map((file) => ({
      fileName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype,
    }));
  }

  const prerequisite = await Prerequisite.create({
    courseId,
    title,
    description,
    videoLinks: videoLinks ? JSON.parse(videoLinks) : [],
    topics: topics ? JSON.parse(topics) : [],
    type,
    materialFiles,
  });

  return sendResponse(res, 201, true, "Prerequisite created", prerequisite);
});

exports.getAllPrerequisites = asyncHandler(async (req, res) => {
  const prerequisites = await Prerequisite.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    { $sort: { createdAt: -1 } },
  ]);

  return sendResponse(res, 200, true, "All prerequisites", prerequisites);
});

exports.getPrerequisiteById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const prerequisite = await Prerequisite.aggregate([
    {
      $match: {
        _id: require("mongoose").Types.ObjectId(id),
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
  ]);

  if (!prerequisite.length) {
    return sendError(res, 404, false, "Prerequisite not found");
  }

  return sendResponse(res, 200, true, "Prerequisite found", prerequisite[0]);
});

exports.updatePrerequisite = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let updateData = { ...req.body };

  if (updateData.videoLinks) {
    updateData.videoLinks = JSON.parse(updateData.videoLinks);
  }

  if (updateData.topics) {
    updateData.topics = JSON.parse(updateData.topics);
  }

  if (req.files && req.files.materialFiles) {
    updateData.materialFiles = req.files.materialFiles.map((file) => ({
      fileName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype,
    }));
  }

  const prerequisite = await Prerequisite.findOneAndUpdate(
    { _id: id, isActive: true },
    updateData,
    { new: true }
  );

  if (!prerequisite) {
    return sendError(res, 404, false, "Prerequisite not found or inactive");
  }

  return sendResponse(res, 200, true, "Prerequisite updated", prerequisite);
});

exports.softDeletePrerequisite = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const prerequisite = await Prerequisite.findOneAndUpdate(
    { _id: id },
    { isActive: false },
    { new: true }
  );

  if (!prerequisite) {
    return sendError(res, 404, false, "Prerequisite not found");
  }

  return sendResponse(res, 200, true, "Prerequisite soft deleted");
});
