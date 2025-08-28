const Sponsorship = require("../models/Sponsorship");
const Hackathon = require("../models/Hackathon");
const SessionCategory = require("../models/SessionCategory");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createSponsorship = asyncHandler(async (req, res) => {
  const {
    sponsorName,
    sponsorType,
    website,
    contactPerson,
    contribution,
    benefits,
    agreementSigned,
    hackathonId,
    sessionCategoryId,
    projectName,
    description,
    technologies,
    startDate,
    endDate,
    status,
    isActive,
  } = req.body;

  const logo = req.file ? `${req.file.filename}` : null;

  if (
    !sponsorName ||
    !sponsorType ||
    !sessionCategoryId ||
    !projectName ||
    !startDate
  ) {
    return sendError(
      res,
      400,
      false,
      "sponsorName, sponsorType, sessionCategoryId, projectName, and startDate are required"
    );
  }

  const hackathon = await Hackathon.findById(hackathonId);
  if (!hackathon) {
    return sendError(res, 404, false, "hackathonId not found");
  }

  const sessionCategory = await SessionCategory.findById(sessionCategoryId);
  if (!sessionCategory) {
    return sendError(res, 404, false, "SessionCategory not found");
  }
  const sponsorship = await Sponsorship.create({
    sponsorName,
    sponsorType,
    logo,
    website,
    contactPerson,
    contribution,
    benefits,
    agreementSigned,
    hackathon: hackathon._id,
    sessionCategory: sessionCategory._id,
    projectName,
    description,
    technologies,
    startDate,
    endDate,
    status,
    isActive,
  });

  return sendResponse(
    res,
    201,
    true,
    "Sponsorship created successfully",
    sponsorship
  );
});

exports.getSponsorships = asyncHandler(async (req, res) => {
  const sponsorships = await Sponsorship.find()
    .populate("sessionCategory", "name type desc isActive")
    .populate(
      "hackathon",
      "title theme description startDate endDate venue mode eligibility maxTeamSize minTeamSize isActive"
    );

  return sendResponse(
    res,
    200,
    true,
    "Sponsorships fetched successfully",
    sponsorships
  );
});

exports.getSponsorshipById = asyncHandler(async (req, res) => {
  const sponsorship = await Sponsorship.findById(req.params.id)
    .populate("sessionCategory", "name type desc isActive")
    .populate(
      "hackathon",
      "title theme description startDate endDate venue mode eligibility maxTeamSize minTeamSize isActive"
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

exports.updateSponsorship = asyncHandler(async (req, res) => {
  const {
    sponsorName,
    sponsorType,
    website,
    contactPerson,
    contribution,
    benefits,
    agreementSigned,
    hackathonId,
    sessionCategoryId,
    projectName,
    description,
    technologies,
    startDate,
    endDate,
    status,
    isActive,
  } = req.body;

  const sponsorshipId = req.params.id;
  const logo = req.file ? `${req.file.filename}` : null;

  const sponsorship = await Sponsorship.findById(sponsorshipId);
  if (!sponsorship) {
    return sendError(res, 404, false, "Sponsorship not found");
  }

  if (hackathonId) {
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return sendError(res, 404, false, "hackathonId not found");
    }
  }

  if (sessionCategoryId) {
    const sessionCategory = await SessionCategory.findById(sessionCategoryId);
    if (!sessionCategory) {
      return sendError(res, 404, false, "SessionCategory not found");
    }
  }

  const updateFields = {
    sponsorName: sponsorName ?? sponsorship.sponsorName,
    sponsorType: sponsorType ?? sponsorship.sponsorType,
    logo: logo ?? sponsorship.logo,
    website: website ?? sponsorship.website,
    contactPerson: contactPerson ?? sponsorship.contactPerson,
    contribution: contribution ?? sponsorship.contribution,
    benefits: benefits ?? sponsorship.benefits,
    agreementSigned: agreementSigned ?? sponsorship.agreementSigned,
    hackathon: hackathonId ?? sponsorship.hackathon,
    sessionCategory: sessionCategoryId ?? sponsorship.sessionCategory,
    projectName: projectName ?? sponsorship.projectName,
    description: description ?? sponsorship.description,
    technologies: technologies ?? sponsorship.technologies,
    startDate: startDate ?? sponsorship.startDate,
    endDate: endDate ?? sponsorship.endDate,
    status: status ?? sponsorship.status,
    isActive: isActive ?? sponsorship.isActive,
  };

  const updatedSponsorship = await Sponsorship.findByIdAndUpdate(
    sponsorshipId,
    { $set: updateFields },
    { new: true }
  );

  return sendResponse(
    res,
    200,
    true,
    "Sponsorship updated successfully",
    updatedSponsorship
  );
});

exports.deleteSponsorship = asyncHandler(async (req, res) => {
  const sponsorship = await Sponsorship.findById(req.params.id);

  if (!sponsorship) {
    return sendError(res, 404, false, "Sponsorship not found");
  }

  await sponsorship.deleteOne();

  return sendResponse(res, 200, true, "Sponsorship deleted successfully");
});
