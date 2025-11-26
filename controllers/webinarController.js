const { sendResponse, sendError } = require("../utils/apiResponse");
const Webinar = require("../models/webinarSession");
const asyncHandler = require("../middleware/asyncHandler");
const mongoose = require("mongoose");
exports.createWebinar = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    date,
    startTime,
    endTime,
    speakerName,
    speakerBio,
    platform,
    meetingLink,
    meetingId,
    meetingdescription,
    passcode,
    registrationRequired,
    maxParticipants,
    tags,
    status,
    createdBy,
  } = req.body;

  const webinar = new Webinar({
    title,
    description,
    date,
    startTime,
    endTime,
    speakerName,
    speakerBio,
    speakerPhoto: req.file ? `${req.file.filename}` : null,
    platform,
    meetingLink,
    meetingdescription,
    meetingId,
    passcode,
    registrationRequired,
    maxParticipants,
    tags: Array.isArray(tags)
      ? tags
      : typeof tags === "string" && tags.length > 0
      ? tags.split(",").map((tag) => tag.trim())
      : [],
    status,
    createdBy,
  });

  await webinar.save();
  return sendResponse(res, 201, true, "Webinar created successfully", webinar);
});

exports.getAllWebinars = asyncHandler(async (req, res) => {
  const webinars = await Webinar.find({ isActive: true })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  return sendResponse(
    res,
    200,
    true,
    "Webinars fetched successfully",
    webinars
  );
});

exports.getWebinarById = asyncHandler(async (req, res) => {
  const webinar = await Webinar.findById(req.params.id).populate(
    "createdBy",
    "name email"
  );
  if (!webinar) return sendError(res, 404, false, "Webinar not found");
  return sendResponse(res, 200, true, "Webinar fetched successfully", webinar);
});

exports.updateWebinar = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.file) {
    updateData.speakerPhoto = `/uploads/webinars/${req.file.filename}`;
  }

  const webinar = await Webinar.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });
  if (!webinar) return sendError(res, 404, false, "Webinar not found");
  return sendResponse(res, 200, true, "Webinar updated successfully", webinar);
});

exports.deleteWebinar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Webinar ID");
  }

  // Find the webinar
  const webinar = await Webinar.findById(id);
  if (!webinar) {
    return sendError(res, 404, false, "Webinar not found");
  }

  // Soft delete
  webinar.isActive = false;
  await webinar.save();

  return sendResponse(
    res,
    200,
    true,
    "Webinar deactivated successfully",
    webinar
  );
});
