const mongoose = require("mongoose");
const Project = require("../models/Project");
const Batch = require("../models/Batch");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createProject = asyncHandler(async (req, res) => {
  const { title, description, batchId, hackathonId } = req.body;

  if (!title) {
    return sendError(res, 400, false, "Project title is required");
  }

  let assignedStudents = [];
  let assignedTrainers = [];

  if (batchId) {
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return sendError(res, 400, false, "Invalid Batch ID");
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return sendError(res, 404, false, "Batch not found");
    }

    assignedStudents = (batch.enrolledIds || []).map((id) => ({
      studentId: id,
      autoCreated: true,
      assignedAt: new Date(),
    }));

    assignedTrainers = (batch.trainer || []).map((id) => ({
      trainerId: id,
      assignedAt: new Date(),
    }));
  }

  const project = await Project.create({
    title,
    description,
    batchId: batchId || null,
    hackathonId: hackathonId || null,
    assignedStudents,
    assignedTrainers,
  });

  return sendResponse(res, 201, true, "Project created successfully", project);
});

exports.getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.aggregate([
    { $match: { isActive: true } },

    {
      $lookup: {
        from: "hackathons",
        localField: "hackathonId",
        foreignField: "_id",
        as: "hackathon",
      },
    },

    {
      $addFields: {
        hackathonName: { $arrayElemAt: ["$hackathon.title", 0] },
      },
    },

    { $sort: { createdAt: -1 } },
  ]);

  return sendResponse(
    res,
    200,
    true,
    "Projects fetched successfully",
    projects
  );
});

exports.getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return sendError(res, 400, false, "Invalid Project ID");
  }

  const project = await Project.findById(projectId)
    .populate("assignedStudents.studentId", "name email")
    .populate("assignedTrainers.trainerId", "name email")
    .populate("submissions.studentId", "name email")
    .populate("submissions.reviewedBy", "name");

  if (!project) {
    return sendError(res, 404, false, "Project not found");
  }

  return sendResponse(res, 200, true, "Project fetched successfully", project);
});

exports.assignStudent = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { studentId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return sendError(res, 400, false, "Invalid Student ID");
  }

  const project = await Project.findOne({
    _id: projectId,
    "assignedStudents.studentId": studentId,
  });

  if (project) {
    return sendError(res, 400, false, "Student already assigned");
  }

  const updated = await Project.findByIdAndUpdate(
    projectId,
    {
      $push: {
        assignedStudents: {
          studentId,
          autoCreated: false,
          assignedAt: new Date(),
        },
      },
    },
    { new: true }
  );

  return sendResponse(res, 200, true, "Student assigned successfully", updated);
});

exports.assignTrainer = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { trainerId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(trainerId)) {
    return sendError(res, 400, false, "Invalid Trainer ID");
  }

  const exists = await Project.findOne({
    _id: projectId,
    "assignedTrainers.trainerId": trainerId,
  });

  if (exists) {
    return sendError(res, 400, false, "Trainer already assigned");
  }

  const updated = await Project.findByIdAndUpdate(
    projectId,
    {
      $push: {
        assignedTrainers: { trainerId, assignedAt: new Date() },
      },
    },
    { new: true }
  );

  return sendResponse(res, 200, true, "Trainer assigned successfully", updated);
});

exports.submitProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { gitLink } = req.body;

  if (!gitLink && !req.file) {
    return sendError(res, 400, false, "Git link or ZIP file required");
  }

  const alreadySubmitted = await Project.findOne({
    _id: projectId,
    "submissions.studentId": req.user._id,
  });

  if (alreadySubmitted) {
    return sendError(res, 400, false, "You already submitted this project");
  }

  const submission = {
    studentId: req.user._id,
    gitLink: gitLink || null,
    zipFile: req.file ? req.file.path : null,
    submittedAt: new Date(),
  };

  const project = await Project.findByIdAndUpdate(
    projectId,
    { $push: { submissions: submission }, $set: { status: "Submitted" } },
    { new: true }
  );

  return sendResponse(
    res,
    200,
    true,
    "Project submitted successfully",
    project
  );
});

exports.reviewSubmission = asyncHandler(async (req, res) => {
  const { projectId, submissionId } = req.params;
  const { reviewStatus, remarks } = req.body;

  if (!["approved", "rejected", "pending"].includes(reviewStatus)) {
    return sendError(res, 400, false, "Invalid review status");
  }

  const updated = await Project.findOneAndUpdate(
    {
      _id: projectId,
      "submissions._id": submissionId,
    },
    {
      $set: {
        "submissions.$.reviewStatus": reviewStatus,
        "submissions.$.remarks": remarks || "",
        "submissions.$.reviewedBy": req.user._id,
        "submissions.$.reviewedAt": new Date(),
        status: "Evaluated",
      },
    },
    { new: true }
  );

  if (!updated) {
    return sendError(res, 404, false, "Submission not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Submission reviewed successfully",
    updated
  );
});

exports.deactivateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return sendError(res, 400, false, "Invalid Project ID");
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    { isActive: false },
    { new: true }
  );

  if (!project) {
    return sendError(res, 404, false, "Project not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Project deactivated successfully",
    project
  );
});
