const Hackathon = require("../models/Hackathon");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");
exports.createHackathon = asyncHandler(async (req, res) => {
  const {
    title,
    theme,
    description,
    startDate,
    endDate,
    venue,
    mode,
    eligibility,
    maxTeamSize,
    minTeamSize,
    registrationDeadline,
    teams,
    judges,
    sponsorships,
    prizes,
    rules,
    isActive,
  } = req.body;

  const hackathon = await Hackathon.create({
    title,
    theme,
    description,
    startDate,
    endDate,
    venue,
    mode,
    eligibility,
    maxTeamSize,
    minTeamSize,
    registrationDeadline,
    teams,
    judges,
    sponsorships,
    prizes,
    rules,
    isActive,
  });

  return sendResponse(
    res,
    201,
    true,
    "Hackathon created successfully",
    hackathon
  );
});

exports.getAllHackathons = asyncHandler(async (req, res) => {
  const hackathons = await Hackathon.aggregate([
    {
      $match: {
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "sponsorships",
        localField: "sponsorships",
        foreignField: "_id",
        as: "sponsorships",
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        startDate: 1,
        endDate: 1,
        prizePool: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        sponsorships: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return sendResponse(
    res,
    200,
    true,
    "Hackathons fetched successfully",
    hackathons
  );
});

exports.getHackathonById = asyncHandler(async (req, res) => {
  const hackathon = await Hackathon.findById(req.params.id).populate(
    "sponsorships"
  );

  if (!hackathon) {
    return sendError(res, 404, false, "Hackathon not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Hackathon fetched successfully",
    hackathon
  );
});

exports.updateHackathon = asyncHandler(async (req, res) => {
  const {
    title,
    theme,
    description,
    startDate,
    endDate,
    venue,
    mode,
    eligibility,
    maxTeamSize,
    minTeamSize,
    registrationDeadline,
    teams,
    judges,
    sponsorships,
    prizes,
    rules,
    isActive,
  } = req.body;

  const hackathon = await Hackathon.findByIdAndUpdate(
    req.params.id,
    {
      title,
      theme,
      description,
      startDate,
      endDate,
      venue,
      mode,
      eligibility,
      maxTeamSize,
      minTeamSize,
      registrationDeadline,
      teams,
      judges,
      sponsorships,
      prizes,
      rules,
      isActive,
    },
    { new: true, runValidators: true }
  );

  if (!hackathon) {
    return sendError(res, 404, false, "Hackathon not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Hackathon updated successfully",
    hackathon
  );
});

exports.deleteHackathon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Hackathon ID");
  }

  const hackathon = await Hackathon.findById(id);

  if (!hackathon) {
    return sendError(res, 404, false, "Hackathon not found");
  }

  hackathon.isActive = false;
  await hackathon.save();

  await hackathon.deleteOne();

  return sendResponse(res, 200, true, "Hackathon deleted successfully");
});
