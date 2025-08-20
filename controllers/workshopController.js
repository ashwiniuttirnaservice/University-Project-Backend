const mongoose = require("mongoose");
const Workshop = require("../models/Workshopsession");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
// controllers/workshopController.js

// Create Workshop
exports.createWorkshop = async (req, res) => {
  try {
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

    const workshop = await Workshop.create({
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
    });

    res.status(201).json({
      success: true,
      message: "Workshop created successfully",
      data: workshop,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all Workshops
// @route   GET /api/workshops
exports.getAllWorkshops = asyncHandler(async (req, res) => {
  const workshops = await Workshop.aggregate([{ $sort: { createdAt: -1 } }]);

  sendResponse(res, 200, true, "Workshops fetched successfully", workshops);
});

// @desc    Get Workshop by ID
// @route   GET /api/workshops/:id
exports.getWorkshopById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const workshop = await Workshop.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
  ]);

  if (!workshop.length) {
    return sendError(res, 404, false, "Workshop not found");
  }

  sendResponse(res, 200, true, "Workshop fetched successfully", workshop[0]);
});

// @desc    Update Workshop
// @route   PUT /api/workshops/:id
exports.updateWorkshop = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await Workshop.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    return sendError(res, 404, false, "Workshop not found");
  }

  sendResponse(res, 200, true, "Workshop updated successfully", updated);
});

// @desc    Delete Workshop
// @route   DELETE /api/workshops/:id
exports.deleteWorkshop = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await Workshop.findByIdAndDelete(id);

  if (!deleted) {
    return sendError(res, 404, false, "Workshop not found");
  }

  sendResponse(res, 200, true, "Workshop deleted successfully", deleted);
});
