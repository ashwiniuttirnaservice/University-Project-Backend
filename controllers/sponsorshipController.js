// controllers/sponsorshipController.js
const Sponsorship = require("../models/Sponsorship");
const SessionCategory = require("../models/SessionCategory");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// @desc    Create Sponsorship (linked with SessionCategory)
// @route   POST /api/sponsorships
// @access  Public/Private
exports.createSponsorship = asyncHandler(async (req, res) => {
  const {
    sponsorName,
    sponsorType,
    logo,
    website,
    contactPerson,
    contribution,
    benefits,
    agreementSigned,
    sessionCategoryId,
  } = req.body;

  // Validate required
  if (!sponsorName || !sponsorType || !sessionCategoryId) {
    return sendError(
      res,
      400,
      false,
      "sponsorName, sponsorType & sessionCategoryId are required"
    );
  }

  // Check if SessionCategory exists
  const sessionCategory = await SessionCategory.findById(sessionCategoryId);
  if (!sessionCategory) {
    return sendError(res, 404, false, "SessionCategory not found");
  }

  // Create Sponsorship
  const sponsorship = await Sponsorship.create({
    sponsorName,
    sponsorType,
    logo,
    website,
    contactPerson,
    contribution,
    benefits,
    agreementSigned,
    sessionCategory: sessionCategory._id,
  });

  return sendResponse(
    res,
    201,
    true,
    "Sponsorship created successfully",
    sponsorship
  );
});

// @desc    Get All Sponsorships
// @route   GET /api/sponsorships
// @access  Public
exports.getSponsorships = asyncHandler(async (req, res) => {
  const sponsorships = await Sponsorship.find().populate(
    "sessionCategory",
    "name type desc isActive"
  );

  return sendResponse(
    res,
    200,
    true,
    "Sponsorships fetched successfully",
    sponsorships
  );
});

// @desc    Get Single Sponsorship by ID
// @route   GET /api/sponsorships/:id
// @access  Public
exports.getSponsorshipById = asyncHandler(async (req, res) => {
  const sponsorship = await Sponsorship.findById(req.params.id).populate(
    "sessionCategory",
    "name type desc isActive"
  );

  if (!sponsorship) {
    return sendError(res, 404, false, "Sponsorship not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Sponsorship fetched successfully",
    sponsorship
  );
});

// @desc    Update Sponsorship
// @route   PUT /api/sponsorships/:id
// @access  Private
exports.updateSponsorship = asyncHandler(async (req, res) => {
  const sponsorship = await Sponsorship.findById(req.params.id);

  if (!sponsorship) {
    return sendError(res, 404, false, "Sponsorship not found");
  }

  const updates = req.body;
  Object.assign(sponsorship, updates);

  await sponsorship.save();

  return sendResponse(
    res,
    200,
    true,
    "Sponsorship updated successfully",
    sponsorship
  );
});

// @desc    Delete Sponsorship
// @route   DELETE /api/sponsorships/:id
// @access  Private
exports.deleteSponsorship = asyncHandler(async (req, res) => {
  const sponsorship = await Sponsorship.findById(req.params.id);

  if (!sponsorship) {
    return sendError(res, 404, false, "Sponsorship not found");
  }

  await sponsorship.deleteOne();

  return sendResponse(res, 200, true, "Sponsorship deleted successfully");
});
