import Trainer from "../models/Trainer.js";
import { sendResponse, sendError } from "../utils/apiResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const registerTrainer = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    mobileNo,
    dob,
    gender,
    address,
    highestQualification,
    specializations,
    collegeName,
    totalExperience,
    subjectExperience,
    availableTiming,
    password,
    linkedinProfile,
  } = req.body;

  const trainer = new Trainer({
    fullName,
    email,
    mobileNo,
    dob,
    gender,
    address,
    highestQualification,
    specializations,
    collegeName,
    totalExperience,
    subjectExperience,
    availableTiming,
    password,
    linkedinProfile,
    resume: req.files?.resume?.[0]?.filename || "",
    idProof: req.files?.idProof?.[0]?.filename || "",
    profilePhoto: req.files?.profilePhoto?.[0]?.filename || "",
  });

  await trainer.save();
  return sendResponse(
    res,
    201,
    true,
    "Trainer registered successfully",
    trainer
  );
});

export const getAllTrainers = asyncHandler(async (req, res) => {
  const trainers = await Trainer.find();
  return sendResponse(
    res,
    200,
    true,
    "Trainers fetched successfully",
    trainers
  );
});

export const updateTrainerApproval = asyncHandler(async (req, res) => {
  const { trainerId } = req.params;
  const { status, approvedBy } = req.body;

  const trainer = await Trainer.findById(trainerId);
  if (!trainer) return sendError(res, 404, false, "Trainer not found");

  trainer.isApproved = status === "approved";
  trainer.approvalStatus = status;
  trainer.approvedBy = approvedBy;
  trainer.approvalDate = new Date();

  await trainer.save();

  return sendResponse(res, 200, true, `Trainer ${status}`, trainer);
});

// Update Trainer (Admin or Self)
export const updateTrainer = asyncHandler(async (req, res) => {
  const { trainerId } = req.params;

  const trainer = await Trainer.findById(trainerId);
  if (!trainer) return sendError(res, 404, "Trainer not found");

  const updateData = req.body;

  // Optional: update files
  if (req.files?.resume?.[0]?.filename) {
    updateData.resume = req.files.resume[0].filename;
  }
  if (req.files?.idProof?.[0]?.filename) {
    updateData.idProof = req.files.idProof[0].filename;
  }
  if (req.files?.profilePhoto?.[0]?.filename) {
    updateData.profilePhoto = req.files.profilePhoto[0].filename;
  }

  const updatedTrainer = await Trainer.findByIdAndUpdate(
    trainerId,
    updateData,
    {
      new: true,
    }
  );

  return sendResponse(res, 200, "Trainer updated successfully", updatedTrainer);
});

export const deleteTrainer = asyncHandler(async (req, res) => {
  const { trainerId } = req.params;

  const trainer = await Trainer.findById(trainerId);
  if (!trainer) return sendError(res, 404, "Trainer not found");

  await trainer.deleteOne();

  return sendResponse(res, 200, "Trainer deleted successfully");
});
