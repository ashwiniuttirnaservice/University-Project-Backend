const Assignment = require("../models/Assignment");
const Chapter = require("../models/Chapter");
const Enrollment = require("../models/Enrollment");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");
const path = require("path");

exports.createAssignments = asyncHandler(async (req, res) => {
  const { course, chapter, title, description, deadline } = req.body;

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

  const titlesArr = Array.isArray(title) ? title : [title];
  const descriptionsArr = Array.isArray(description)
    ? description
    : [description];
  const deadlinesArr = Array.isArray(deadline) ? deadline : [deadline];

  const assignmentsData = req.files.map((file, index) => ({
    course,
    chapter,
    title: titlesArr[index] || `Assignment ${index + 1}`,
    description: descriptionsArr[index] || "",
    deadline: deadlinesArr[index] ? new Date(deadlinesArr[index]) : null,
    fileUrl: path.basename(file.path),
  }));

  const assignments = await Assignment.insertMany(assignmentsData);

  await Chapter.findByIdAndUpdate(chapter, {
    $push: { assignments: { $each: assignments.map((a) => a._id) } },
  });

  return sendResponse(
    res,
    201,
    true,
    "Assignments created successfully",
    assignments
  );
});

exports.submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId, enrollmentId, remarks } = req.body;

  if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
    return sendError(res, 400, false, "Valid assignmentId is required");
  }

  if (!enrollmentId || !mongoose.Types.ObjectId.isValid(enrollmentId)) {
    return sendError(res, 400, false, "Valid enrollmentId is required");
  }

  if (!req.file) {
    return sendError(res, 400, false, "Please upload your assignment file");
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) return sendError(res, 404, false, "Enrollment not found");

  const alreadySubmitted = assignment.submissions?.some(
    (s) => s.student.toString() === enrollmentId
  );

  if (alreadySubmitted) {
    return sendError(
      res,
      400,
      false,
      "You have already submitted this assignment"
    );
  }

  const filename = path.basename(req.file.path);

  assignment.submissions.push({
    student: enrollmentId,
    fileUrl: filename,
    remarks: remarks || "",
    status: "submitted",
  });

  await assignment.save();

  await Enrollment.findByIdAndUpdate(enrollmentId, {
    $push: { assignmentSubmissions: assignment._id },
  });

  return sendResponse(
    res,
    201,
    true,
    "Assignment submitted successfully",
    assignment
  );
});

exports.getAllAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find()
    .populate("course")
    .populate("chapter")
    .populate("submissions.student");

  return sendResponse(res, 200, true, "All assignments fetched", assignments);
});

exports.getAssignmentsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return sendError(res, 400, false, "Invalid Course ID");
  }

  const assignments = await Assignment.aggregate([
    {
      $lookup: {
        from: "chapters",
        localField: "chapter",
        foreignField: "_id",
        as: "chapter",
      },
    },
    { $unwind: "$chapter" },
    {
      $lookup: {
        from: "weeks",
        localField: "chapter.week",
        foreignField: "_id",
        as: "week",
      },
    },
    { $unwind: "$week" },
    {
      $lookup: {
        from: "phases",
        localField: "week.phase",
        foreignField: "_id",
        as: "phase",
      },
    },
    { $unwind: "$phase" },
    { $match: { "phase.course": new mongoose.Types.ObjectId(courseId) } },
    {
      $project: {
        title: 1,
        description: 1,
        deadline: 1,
        fileUrl: 1,
        status: 1,
        "chapter._id": 1,
        "chapter.title": 1,
      },
    },
  ]);

  if (!assignments.length)
    return sendError(res, 404, false, "No assignments found for this course");

  return sendResponse(
    res,
    200,
    true,
    "Assignments fetched successfully",
    assignments
  );
});

exports.getAssignmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid assignment ID");
  }

  const assignment = await Assignment.findById(id)
    .populate("course")
    .populate("chapter")
    .populate("submissions.student");

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
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid assignment ID");
  }

  const assignment = await Assignment.findById(id);
  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  assignment.isActive = false;
  await assignment.save();

  return sendResponse(
    res,
    200,
    true,
    "Assignment soft deleted successfully",
    assignment
  );
});
