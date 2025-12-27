const ContactInfo = require("../models/ContactInfo");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const path = require("path");

exports.createContactInfo = asyncHandler(async (req, res) => {
  const {
    companyName,
    address,
    googleMapLink,
    email,
    phoneNumbers,
    workingHours,
    about,
    isActive,
  } = req.body;

  let logo = null;
  if (req.file) logo = path.basename(req.file.path);

  const newContactInfo = await ContactInfo.create({
    companyName,
    logo,
    address,
    googleMapLink,
    email,
    phoneNumbers,
    workingHours,
    about,
    isActive,
  });

  sendResponse(
    res,
    200,
    true,
    "Contact Info saved successfully",
    newContactInfo
  );
});

exports.getAllContactInfo = asyncHandler(async (req, res) => {
  const contactInfos = await ContactInfo.find({ isActive: true });
  sendResponse(
    res,
    200,
    true,
    "All active contact info fetched successfully",
    contactInfos
  );
});

exports.getContactInfoById = asyncHandler(async (req, res) => {
  const contactInfo = await ContactInfo.findById(req.params.id);
  if (!contactInfo) return sendError(res, 404, "Contact Info not found");
  sendResponse(
    res,
    200,
    true,
    "Contact Info fetched successfully",
    contactInfo
  );
});

exports.updateContactInfo = asyncHandler(async (req, res) => {
  const {
    companyName,
    address,
    googleMapLink,
    email,
    phoneNumbers,
    workingHours,
    about,
    isActive,
  } = req.body;

  let updateData = {
    companyName,
    address,
    googleMapLink,
    email,
    phoneNumbers,
    workingHours,
    about,
    isActive,
  };

  if (req.file) updateData.logo = path.basename(req.file.path);

  const updatedInfo = await ContactInfo.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedInfo) return sendError(res, 404, "Contact Info not found");

  sendResponse(
    res,
    200,
    true,
    "Contact Info updated successfully",
    updatedInfo
  );
});

exports.deleteContactInfo = asyncHandler(async (req, res) => {
  const contactInfo = await ContactInfo.findById(req.params.id);
  if (!contactInfo) return sendError(res, 404, "Contact Info not found");

  contactInfo.isActive = false;
  await contactInfo.save();

  sendResponse(res, 200, true, "Contact Info hidden successfully", contactInfo);
});
