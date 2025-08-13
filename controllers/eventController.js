const Event = require("../models/EventSession ");

const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// Create Event
exports.createEvent = asyncHandler(async (req, res) => {
  try {
    const eventData = { ...req.body };

    // Single banner image
    if (req.files && req.files.bannerImage) {
      eventData.bannerImage = req.files.bannerImage[0].path;
    }

    // Multiple gallery images
    if (req.files && req.files.gallery) {
      eventData.gallery = req.files.gallery.map((file) => file.path);
    }

    const event = new Event(eventData);
    await event.save();

    return sendResponse(res, 201, true, "Event created successfully", event);
  } catch (error) {
    return sendError(res, 500, false, error.message);
  }
});

// Get all events
exports.getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .populate("category", "name slug")
    .sort({ createdAt: -1 });

  return sendResponse(res, 200, true, "Events fetched successfully", events);
});

// Get single event by ID
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

// Update event
exports.updateEvent = asyncHandler(async (req, res) => {
  try {
    const eventData = { ...req.body };

    if (req.files && req.files.bannerImage) {
      eventData.bannerImage = req.files.bannerImage[0].path;
    }

    if (req.files && req.files.gallery) {
      eventData.gallery = req.files.gallery.map((file) => file.path);
    }

    const event = await Event.findByIdAndUpdate(req.params.id, eventData, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return sendError(res, 404, false, "Event not found");
    }

    return sendResponse(res, 200, true, "Event updated successfully", event);
  } catch (error) {
    return sendError(res, 500, false, error.message);
  }
});

// Delete event
exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    return sendError(res, 404, false, "Event not found");
  }
  return sendResponse(res, 200, true, "Event deleted successfully");
});
