const mongoose = require("mongoose");
const Trainer = require("../models/Trainer");
const { sendResponse, sendError } = require("../utils/apiResponse");
const asyncHandler = require("../middleware/asyncHandler");

const parseObjectIdArray = (input) => {
  try {
    if (typeof input === "string") input = JSON.parse(input);
  } catch {
    input = [input];
  }

  if (!Array.isArray(input)) input = [input];
  return input.map((id) => new mongoose.Types.ObjectId(id));
};

const registerTrainer = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    mobileNo,
    dob,
    gender,
    address,
    highestQualification,
    collegeName,
    totalExperience,
    availableTiming,
    password,
    linkedinProfile,
    title,
    summary,
    certifications,
    achievements,
    courses,
    batches,
    branches,
  } = req.body;

  const trainer = new Trainer({
    fullName,
    email,
    mobileNo,
    dob,
    gender,
    address: typeof address === "string" ? JSON.parse(address) : address,
    highestQualification,
    collegeName,
    totalExperience,
    availableTiming,
    password,
    linkedinProfile,
    title,
    summary,
    certifications:
      typeof certifications === "string"
        ? JSON.parse(certifications)
        : certifications,
    achievements:
      typeof achievements === "string"
        ? JSON.parse(achievements)
        : achievements,
    courses: parseObjectIdArray(courses),
    batches: parseObjectIdArray(batches),
    branches: parseObjectIdArray(branches)[0] || null,
    resume: req.files?.resume?.[0]?.filename || "",
    idProofTrainer: req.files?.idProofTrainer?.[0]?.filename || "",
    profilePhotoTrainer: req.files?.profilePhotoTrainer?.[0]?.filename || "",
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

const getAllTrainers = asyncHandler(async (req, res) => {
  const trainers = await Trainer.find().populate("courses").populate("batches");

  return sendResponse(
    res,
    200,
    true,
    "Trainers fetched successfully",
    trainers
  );
});

const getAllTrainer = asyncHandler(async (req, res) => {
  const trainers = await Trainer.find().select(
    "highestQualification fullName profilePhotoTrainer summary linkedinProfilex"
  );

  return sendResponse(
    res,
    200,
    true,
    "Trainers fetched successfully",
    trainers
  );
});

const updateTrainerApproval = asyncHandler(async (req, res) => {
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

const updateTrainer = asyncHandler(async (req, res) => {
  const { trainerId } = req.params;
  const trainer = await Trainer.findById(trainerId);
  if (!trainer) return sendError(res, 404, "Trainer not found");

  let updateData = req.body;

  if (updateData.address && typeof updateData.address === "string") {
    updateData.address = JSON.parse(updateData.address);
  }

  if (
    updateData.certifications &&
    typeof updateData.certifications === "string"
  ) {
    updateData.certifications = JSON.parse(updateData.certifications);
  }

  if (updateData.achievements && typeof updateData.achievements === "string") {
    updateData.achievements = JSON.parse(updateData.achievements);
  }

  delete updateData.testimonials;
  delete updateData.rating;
  delete updateData.reviews;

  if (req.files?.resume?.[0]?.filename) {
    updateData.resume = req.files.resume[0].filename;
  }

  if (req.files?.idProofTrainer?.[0]?.filename) {
    updateData.idProofTrainer = req.files.idProofTrainer[0].filename;
  }

  if (req.files?.profilePhotoTrainer?.[0]?.filename) {
    updateData.profilePhotoTrainer = req.files.profilePhotoTrainer[0].filename;
  }

  if (updateData.branches) {
    updateData.branches = parseObjectIdArray(updateData.branches)[0] || null;
  }

  if (updateData.courses) {
    updateData.courses = parseObjectIdArray(updateData.courses);
  }

  if (updateData.batches) {
    updateData.batches = parseObjectIdArray(updateData.batches);
  }

  const updatedTrainer = await Trainer.findByIdAndUpdate(
    trainerId,
    updateData,
    { new: true }
  );

  return sendResponse(
    res,
    200,
    true,
    "Trainer updated successfully",
    updatedTrainer
  );
});

const getTrainerSummary = asyncHandler(async (req, res) => {
  const trainers = await Trainer.aggregate([
    {
      $project: {
        trainerId: "$_id",
        fullName: 1,
        email: 1,
        mobileNo: 1,
        title: 1,
        _id: 0,
      },
    },
  ]);

  if (!trainers || trainers.length === 0) {
    return sendError(res, 404, false, "No trainers found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Trainer summary fetched successfully",
    trainers
  );
});

const deleteTrainer = asyncHandler(async (req, res) => {
  const { trainerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(trainerId)) {
    return sendError(res, 400, false, "Invalid Trainer ID");
  }

  const trainer = await Trainer.findById(trainerId);
  if (!trainer) {
    return sendError(res, 404, false, "Trainer not found");
  }

  trainer.isActive = false;
  await trainer.save();

  return sendResponse(
    res,
    200,
    true,
    "Trainer deactivated successfully",
    trainer
  );
});

const getTrainerById = asyncHandler(async (req, res) => {
  const { trainerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(trainerId)) {
    return sendError(res, 400, false, "Invalid trainer ID");
  }

  const trainer = await Trainer.findById(trainerId)
    .populate("courses", "title")

    .populate("batches", "batchName startDate endDate mode status");

  if (!trainer) {
    return sendError(res, 404, false, "Trainer not found");
  }

  return sendResponse(res, 200, true, "Trainer fetched successfully", trainer);
});

const getApprovedTrainers = asyncHandler(async (req, res) => {
  const trainers = await Trainer.find({
    isApproved: true,
    approvalStatus: "approved",
    isActive: true,
  })
    .populate("courses", "title description")
    .populate("batches", "batchName timing")
    .sort({ createdAt: -1 });

  if (!trainers.length) {
    return sendError(res, 404, false, "No approved trainers found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Approved trainers fetched successfully",
    trainers
  );
});

module.exports = {
  registerTrainer,
  getAllTrainer,
  getApprovedTrainers,
  getAllTrainers,
  updateTrainerApproval,
  updateTrainer,
  deleteTrainer,
  getTrainerSummary,
  getTrainerById,
};
