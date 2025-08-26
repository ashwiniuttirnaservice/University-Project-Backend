const Event = require("../models/EventSession ");

const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    startDate,
    endDate,
    duration,
    location,
    prerequisites,
    topics,
    tools,
    instructors,
    schedule,
    registrationLink,
    fees,
    certification,
    contact,
    status,
  } = req.body;

  let eventData = {
    title,
    description,
    startDate,
    endDate,
    duration,
    location,
    prerequisites,
    topics,
    tools,
    instructors,
    schedule,
    registrationLink,
    fees,
    certification,
    contact,
    status,
    bannerImage: null,
    gallery: [],
  };

  if (req.files && req.files.bannerImage) {
    eventData.bannerImage = req.files.bannerImage[0].path;
  }

  if (req.files && req.files.gallery) {
    eventData.gallery = req.files.gallery.map((file) => file.path);
  }

  const event = await Event.create(eventData);

  return sendResponse(res, 201, true, "Event created successfully", event);
});

exports.getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .populate("category", "name slug")
    .sort({ createdAt: -1 });

  return sendResponse(res, 200, true, "Events fetched successfully", events);
});

exports.getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    "category",
    "name slug"
  );
  if (!event) {
    return sendError(res, 404, false, "Event not found");
  }
  return sendResponse(res, 200, true, "Event fetched successfully", event);
});

exports.updateEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id;

  const {
    title,
    description,
    startDate,
    endDate,
    duration,
    location,
    prerequisites,
    topics,
    tools,
    instructors,
    schedule,
    registrationLink,
    fees,
    certification,
    contact,
    status,
  } = req.body;

  let updatedData = {
    title,
    description,
    startDate,
    endDate,
    duration,
    location,
    prerequisites,
    topics,
    tools,
    instructors,
    schedule,
    registrationLink,
    fees,
    certification,
    contact,
    status,
  };

  // Handle file updates
  if (req.files && req.files.bannerImage) {
    updatedData.bannerImage = req.files.bannerImage[0].path;
  }

  if (req.files && req.files.gallery) {
    updatedData.gallery = req.files.gallery.map((file) => file.path);
  }

  const event = await Event.findByIdAndUpdate(eventId, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  return sendResponse(res, 200, true, "Event updated successfully", event);
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    return sendError(res, 404, false, "Event not found");
  }
  return sendResponse(res, 200, true, "Event deleted successfully");
});
