const mongoose = require("mongoose");
const Workshop = require("../models/Workshopsession");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

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
      isFree,
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
      isFree,
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

exports.getAllWorkshops = asyncHandler(async (req, res) => {
  const workshops = await Workshop.aggregate([
    { $match: { isActive: true } },

    {
      $lookup: {
        from: "phases",
        localField: "phaseId",
        foreignField: "_id",
        as: "phase",
      },
    },
    { $unwind: { path: "$phase", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "users",
        localField: "trainerId",
        foreignField: "_id",
        as: "trainer",
      },
    },
    { $unwind: { path: "$trainer", preserveNullAndEmptyArrays: true } },

    { $sort: { createdAt: -1 } },
  ]);

  return sendResponse(
    res,
    200,
    true,
    "Workshops fetched successfully",
    workshops
  );
});

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
exports.deleteWorkshop = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Workshop ID");
  }

  const workshop = await Workshop.findById(id);
  if (!workshop) {
    return sendError(res, 404, false, "Workshop not found");
  }

  workshop.isActive = false;
  await workshop.save();

  return sendResponse(
    res,
    200,
    true,
    "Workshop deactivated successfully",
    workshop
  );
});
