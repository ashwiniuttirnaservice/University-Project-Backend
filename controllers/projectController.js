const mongoose = require("mongoose");
const Project = require("../models/Project");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createProject = asyncHandler(async (req, res) => {
  const { title, description, hackathonId } = req.body;

  if (!title) {
    return sendError(res, 400, false, "Project title is required");
  }

  const project = await Project.create({
    title,
    description,
    hackathonId: hackathonId || null,
    createdBy: req.user._id,
  });

  return sendResponse(res, 201, true, "Project created", project);
});

exports.getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.aggregate([
    {
      $match: { isActive: true },
    },

    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    { $unwind: "$createdBy" },

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
        createdByName: "$createdBy.name",
        hackathonName: { $arrayElemAt: ["$hackathon.title", 0] },
      },
    },

    { $sort: { createdAt: -1 } },
  ]);

  return sendResponse(res, 200, true, "Projects fetched", projects);
});

exports.getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return sendError(res, 400, false, "Invalid Project ID");
  }

  const project = await Project.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(projectId) } },

    {
      $lookup: {
        from: "users",
        localField: "assignedStudents.studentId",
        foreignField: "_id",
        as: "students",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "assignedTrainers.trainerId",
        foreignField: "_id",
        as: "trainers",
      },
    },
  ]);

  if (project.length === 0) {
    return sendError(res, 404, false, "Project not found");
  }

  return sendResponse(res, 200, true, "Project fetched", project[0]);
});

exports.assignStudent = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { studentId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return sendError(res, 400, false, "Invalid Student ID");
  }

  const project = await Project.findByIdAndUpdate(
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

  return sendResponse(res, 200, true, "Student assigned", project);
});

exports.assignTrainer = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { trainerId } = req.body;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      $push: {
        assignedTrainers: { trainerId, assignedAt: new Date() },
      },
    },
    { new: true }
  );

  return sendResponse(res, 200, true, "Trainer assigned", project);
});

exports.submitProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { gitLink } = req.body;

  const zipFile = req.file ? req.file.path : null;

  const submission = {
    studentId: req.user._id,
    gitLink,
    zipFile,
    submittedAt: new Date(),
  };

  const project = await Project.findByIdAndUpdate(
    projectId,
    { $push: { submissions: submission } },
    { new: true }
  );

  return sendResponse(res, 200, true, "Project submitted", project);
});

exports.reviewSubmission = asyncHandler(async (req, res) => {
  const { projectId, submissionId } = req.params;
  const { reviewStatus, remarks } = req.body;

  const updated = await Project.findOneAndUpdate(
    {
      _id: projectId,
      "submissions._id": submissionId,
    },
    {
      $set: {
        "submissions.$.reviewStatus": reviewStatus,
        "submissions.$.remarks": remarks,
        "submissions.$.reviewedBy": req.user._id,
        "submissions.$.reviewedAt": new Date(),
      },
    },
    { new: true }
  );

  return sendResponse(res, 200, true, "Submission reviewed", updated);
});
