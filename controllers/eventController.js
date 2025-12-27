const Event = require("../models/EventSession ");
const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const path = require("path");

exports.createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    description,
    category,
    startDate,
    endDate,
    startTime,
    endTime,
    location,
    mode,
    meetingLink,
    organizer,
    speakers,
    registrationLink,
    isFree,
    price,
    maxParticipants,
    tags,
    priority,
    agenda,
    resources,
    sponsors,
    certificateAvailable,
    feedbackFormLink,
    socialLinks,
    status,
  } = req.body;

  let eventData = {
    title,
    slug,
    description,
    category,
    startDate,
    endDate,
    startTime,
    endTime,
    location,
    mode,
    meetingLink,
    organizer,
    speakers,
    registrationLink,
    isFree,
    price,
    maxParticipants,
    tags,
    priority,
    agenda,
    resources,
    sponsors,
    certificateAvailable,
    feedbackFormLink,
    socialLinks,
    status,
    bannerImage: null,
    gallery: [],
  };

  if (req.files && req.files.bannerImage) {
    eventData.bannerImage = path.basename(req.files.bannerImage[0].path);
  }

  if (req.files && req.files.gallery) {
    eventData.gallery = req.files.gallery.map((file) =>
      path.basename(file.path)
    );
  }

  const event = await Event.create(eventData);

  return sendResponse(res, 201, true, "Event created successfully", event);
});
exports.getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.aggregate([
    {
      $match: {
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        date: 1,
        location: 1,
        createdAt: 1,
        updatedAt: 1,
        isActive: 1,
        category: {
          _id: 1,
          name: "$category.name",
          slug: "$category.slug",
        },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

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
    slug,
    description,
    category,
    startDate,
    endDate,
    startTime,
    endTime,
    location,
    mode,
    meetingLink,
    organizer,
    speakers,
    registrationLink,
    isFree,
    price,
    maxParticipants,
    tags,
    priority,
    agenda,
    resources,
    sponsors,
    certificateAvailable,
    feedbackFormLink,
    socialLinks,
    status,
  } = req.body;

  let updatedData = {
    title,
    slug,
    description,
    category,
    startDate,
    endDate,
    startTime,
    endTime,
    location,
    mode,
    meetingLink,
    organizer,
    speakers,
    registrationLink,
    isFree,
    price,
    maxParticipants,
    tags,
    priority,
    agenda,
    resources,
    sponsors,
    certificateAvailable,
    feedbackFormLink,
    socialLinks,
    status,
  };

  if (req.files && req.files.bannerImage) {
    updatedData.bannerImage = path.basename(req.files.bannerImage[0].path);
  }

  if (req.files && req.files.gallery) {
    updatedData.gallery = req.files.gallery.map((file) =>
      path.basename(file.path)
    );
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
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Event ID");
  }

  const event = await Event.findById(id);

  if (!event) {
    return sendError(res, 404, false, "Event not found");
  }

  event.isActive = false;
  await event.save();

  await event.deleteOne();

  return sendResponse(res, 200, true, "Event deleted successfully");
});
