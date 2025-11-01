const Assignment = require("../models/Assignment");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");
const path = require("path");
const Chapter = require("../models/Chapter");

exports.createAssignments = asyncHandler(async (req, res) => {
  const { chapter, titles, descriptions, deadlines } = req.body;

  if (!chapter || !mongoose.Types.ObjectId.isValid(chapter)) {
    return sendError(res, 400, false, "Valid chapter ID is required");
  }

  if (!req.files || req.files.length === 0) {
    return sendError(
      res,
      400,
      false,
      "At least one assignment file is required"
    );
  }

  const titlesArr = Array.isArray(titles) ? titles : [titles];
  const descriptionsArr = Array.isArray(descriptions)
    ? descriptions
    : [descriptions];
  const deadlinesArr = Array.isArray(deadlines) ? deadlines : [deadlines];

  const assignmentsData = req.files.map((file, index) => {
    const filename = path.basename(file.path);

    return {
      chapter,
      title: titlesArr[index] || `Assignment ${index + 1}`,
      description: descriptionsArr[index] || "",
      deadline: deadlinesArr[index] ? new Date(deadlinesArr[index]) : null,
      fileUrl: filename,
    };
  });

  const assignments = await Assignment.insertMany(assignmentsData);

  await Chapter.findByIdAndUpdate(chapter, {
    $push: { assignments: { $each: assignments.map((a) => a._id) } },
  });

  return sendResponse(
    res,
    201,
    true,
    "Assignments created successfully and linked to chapter",
    assignments
  );
});

exports.getAllAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find().populate("chapter");
  return sendResponse(res, 200, true, "All assignments fetched", assignments);
});

exports.getAssignmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid assignment ID");
  }

  const assignment = await Assignment.findById(id).populate("chapter");

  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  return sendResponse(res, 200, true, "Assignment fetched", assignment);
});

exports.updateAssignment = asyncHandler(async (req, res) => {
  const { title, description, deadline, status, score } = req.body;
  const updateData = { title, description, deadline, status, score };

  if (req.file) updateData.fileUrl = path.basename(req.file.path);

  const assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  return sendResponse(res, 200, true, "Assignment updated", assignment);
});

exports.deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);

  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  return sendResponse(res, 200, true, "Assignment deleted", null);
});
