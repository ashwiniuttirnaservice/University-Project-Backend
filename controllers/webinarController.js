const { sendResponse, sendError } = require("../utils/apiResponse");
const Webinar = require("../models/webinarSession");
const asyncHandler = require("../middleware/asyncHandler");

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
    speakerPhoto: req.file ? `/uploads/webinars/${req.file.filename}` : null,
    platform,
    meetingLink,
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
  const webinars = await Webinar.find().populate("createdBy", "name email");
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
  const webinar = await Webinar.findByIdAndDelete(req.params.id);
  if (!webinar) return sendError(res, 404, false, "Webinar not found");
  return sendResponse(res, 200, true, "Webinar deleted successfully");
});
