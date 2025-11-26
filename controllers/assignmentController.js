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
  if (!req.files || req.files.length === 0) {
    return sendError(res, 400, false, "Please upload at least one file");
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

  const files = req.files.map((f) => path.basename(f.path));

  assignment.submissions.push({
    student: enrollmentId,
    files,
    remarks: remarks || "",
    status: "submitted",
    submittedAt: new Date(),
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
  const assignments = await Assignment.find({ isActive: true })
    .populate("course")
    .populate("chapter")
    .populate("submissions.student");

  return sendResponse(res, 200, true, "All assignments fetched", assignments);
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

exports.getAssignmentsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return sendError(res, 400, false, "Invalid Course ID");
  }

  const assignments = await Assignment.find({
    course: courseId,
    isActive: true,
  })
    .populate("chapter")
    .populate("submissions.student");

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

exports.getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid assignment ID");
  }

  const assignment = await Assignment.findById(id).populate({
    path: "submissions.student",
    select: "fullName email",
  });

  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  const submissionLog = assignment.submissions.map((s) => ({
    participant: s.student?.fullName || "Unknown",
    submittedOn: s.submittedAt ? s.submittedAt.toISOString().split("T")[0] : "",
    status: s.status,
    file: s.fileUrl,
    marks: s.score,
  }));

  return sendResponse(
    res,
    200,
    true,
    "Submission log fetched successfully",
    submissionLog
  );
});

exports.updateAssignment = asyncHandler(async (req, res) => {
  const { title, description, deadline, status, score } = req.body;
  const updateData = { title, description, deadline, status, score };

  if (req.file) updateData.fileUrl = path.basename(req.file.path);

  const assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  return sendResponse(res, 200, true, "Assignment updated", assignment);
});

const XLSX = require("xlsx");

const fs = require("fs");

exports.downloadSubmissionLogExcelByStudent = asyncHandler(async (req, res) => {
  const { assignmentId, studentId } = req.params;

  // --------- Validate IDs ---------
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return sendError(res, 400, false, "Invalid assignment ID");
  }
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return sendError(res, 400, false, "Invalid student ID");
  }

  // --------- Fetch Assignment + Populate Student ---------
  const assignment = await Assignment.findById(assignmentId).populate({
    path: "submissions.student",
    select: "fullName email",
  });

  if (!assignment) {
    return sendError(res, 404, false, "Assignment not found");
  }

  // --------- Fetch Student ---------
  const student = await Enrollment.findById(studentId).select("fullName");
  if (!student) {
    return sendError(res, 404, false, "Student not found");
  }

  // --------- Find Submission of this Student ---------
  const submission = assignment.submissions.find(
    (s) => s.student?._id?.toString() === studentId
  );

  // --------- Prepare Excel Data ---------
  const data = [
    {
      Participant: student.fullName,
      "Submitted On": submission?.submittedAt
        ? submission.submittedAt.toISOString().split("T")[0]
        : "",
      Status: submission?.status || "pending",
      File: submission?.files?.length ? submission.files.join(", ") : "",
      Marks: submission?.score || "",
    },
  ];

  // --------- Generate Excel ---------
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Submission");

  // --------- Create Temp Folder ---------
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // --------- Save File ---------
  const fileName = `Assignment_${assignmentId}_Student_${studentId}.xlsx`;
  const filePath = path.join(tempDir, fileName);
  XLSX.writeFile(wb, filePath);

  // --------- Download & Delete Temp File ---------
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.log("Excel download error:", err);
    }
    fs.unlinkSync(filePath);
  });
});

exports.deleteAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid assignment ID");
  }

  const assignment = await Assignment.findById(id);
  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  assignment.isActive = false;
  assignment.status = "inactive";
  await assignment.save();

  return sendResponse(
    res,
    200,
    true,
    "Assignment soft deleted successfully",
    assignment
  );
});

exports.gradeAssignment = asyncHandler(async (req, res) => {
  const { assignmentId, submissionId, score, status, remarks } = req.body;

  if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
    return sendError(res, 400, false, "Valid assignmentId is required");
  }

  if (!submissionId || !mongoose.Types.ObjectId.isValid(submissionId)) {
    return sendError(res, 400, false, "Valid submissionId is required");
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  const submission = assignment.submissions.id(submissionId);
  if (!submission) return sendError(res, 404, false, "Submission not found");

  if (req.files && req.files.length > 0) {
    const photos = req.files.map((f) => path.basename(f.path));

    if (!submission.mistakePhotos) submission.mistakePhotos = [];
    submission.mistakePhotos.push(...photos);
  }

  if (score !== undefined) submission.score = score;
  if (status) submission.status = status;
  if (remarks) submission.remarks = remarks;

  await assignment.save();

  return sendResponse(
    res,
    200,
    true,
    "Submission graded successfully",
    submission
  );
});

exports.resubmitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId, submissionId, remarks } = req.body;

  if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
    return sendError(res, 400, false, "Valid assignmentId is required");
  }
  if (!submissionId || !mongoose.Types.ObjectId.isValid(submissionId)) {
    return sendError(res, 400, false, "Valid submissionId is required");
  }

  if (!req.files || req.files.length === 0) {
    return sendError(res, 400, false, "Please upload at least one file");
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  const submission = assignment.submissions.id(submissionId);
  if (!submission) return sendError(res, 404, false, "Submission not found");

  const uploadedFiles = req.files.map((f) => path.basename(f.path));

  submission.files.push(...uploadedFiles);

  submission.remarks = remarks || submission.remarks;

  submission.status = "resubmitted";
  submission.submittedAt = new Date();

  await assignment.save();

  return sendResponse(
    res,
    200,
    true,
    "Assignment re-submitted successfully (files added)",
    submission
  );
});
