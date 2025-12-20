const Assignment = require("../models/Assignment");
const Chapter = require("../models/Chapter");
const Batch = require("../models/Batch");
const Enrollment = require("../models/Enrollment");
const Student = require("../models/Student");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");
const path = require("path");
const XLSX = require("xlsx");
const fs = require("fs");

exports.createAssignments = asyncHandler(async (req, res) => {
  const { course, chapter, batches, title, description, deadline } = req.body;

  if (!batches || !mongoose.Types.ObjectId.isValid(batches)) {
    return sendError(res, 400, false, "Valid batch ID is required");
  }

  if (!req.files || req.files.length === 0) {
    return sendError(res, 400, false, "At least one file is required");
  }

  const titles = Array.isArray(title) ? title : [title];
  const descriptions = Array.isArray(description) ? description : [description];
  const deadlines = Array.isArray(deadline) ? deadline : [deadline];

  const data = req.files.map((file, i) => ({
    course,
    chapter: chapter || null,
    batches,
    title: titles[i] || `Assignment ${i + 1}`,
    description: descriptions[i] || "",
    deadline: deadlines[i] ? new Date(deadlines[i]) : null,
    fileUrl: path.basename(file.path),
  }));

  const assignments = await Assignment.insertMany(data);

  if (chapter && mongoose.Types.ObjectId.isValid(chapter)) {
    await Chapter.findByIdAndUpdate(chapter, {
      $push: { assignments: { $each: assignments.map((a) => a._id) } },
    });
  }

  await Batch.findByIdAndUpdate(batches, {
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
  const { assignmentId, studentId, enrollmentId, remarks, status, githubLink } =
    req.body;

  if (!mongoose.Types.ObjectId.isValid(assignmentId))
    return sendError(res, 400, false, "Invalid assignmentId");

  const userId = studentId || enrollmentId;
  if (!mongoose.Types.ObjectId.isValid(userId))
    return sendError(res, 400, false, "studentId or enrollmentId required");

  if ((!req.files || req.files.length === 0) && !githubLink)
    return sendError(res, 400, false, "Upload file or GitHub link");

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  const already = assignment.submissions.some(
    (s) => s.student.toString() === userId.toString()
  );
  if (already) return sendError(res, 400, false, "Already submitted");

  const files = [];
  if (req.files) files.push(...req.files.map((f) => path.basename(f.path)));
  if (githubLink) files.push(githubLink.trim());

  assignment.submissions.push({
    student: userId,
    files,
    remarks: remarks || "",
    status,
  });

  await assignment.save();

  return sendResponse(res, 201, true, "Assignment submitted", assignment);
});

exports.getAllAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find({ isActive: true })
    .populate("course")
    .populate("chapter")
    .populate("submissions.student");

  return sendResponse(res, 200, true, "Assignments fetched", assignments);
});

exports.getAssignmentById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return sendError(res, 400, false, "Invalid ID");

  const assignment = await Assignment.findById(req.params.id)
    .populate("course")
    .populate("chapter")
    .populate("submissions.student");

  if (!assignment) return sendError(res, 404, false, "Not found");

  return sendResponse(res, 200, true, "Assignment fetched", assignment);
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

  if (!assignment) {
    return sendError(res, 404, false, "Assignment not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Assignment fetched successfully",
    assignment
  );
});

exports.updateAssignment = asyncHandler(async (req, res) => {
  const { course, chapter, title, description, deadline, status, score } =
    req.body;

  const updateData = {
    course,
    chapter,
    title,
    description,
    deadline,
    status,
    score,
  };

  if (req.file) {
    updateData.fileUrl = path.basename(req.file.path);
  }

  const assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!assignment) {
    return sendError(res, 404, false, "Assignment not found");
  }

  return sendResponse(res, 200, true, "Assignment updated", assignment);
});

exports.downloadSubmissionLogExcelByStudent = asyncHandler(async (req, res) => {
  const { assignmentId, studentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return sendError(res, 400, false, "Invalid assignment ID");
  }
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return sendError(res, 400, false, "Invalid student ID");
  }

  const assignment = await Assignment.findById(assignmentId).populate([
    {
      path: "submissions.student",
      select: "fullName email",
    },
    {
      path: "course",
      select: "title",
    },
  ]);

  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  const student = await Enrollment.findById(studentId).select("fullName");
  if (!student) return sendError(res, 404, false, "Student not found");

  const submission = assignment.submissions.find(
    (s) => s.student?._id?.toString() === studentId
  );

  const submittedDate = submission?.submittedAt
    ? submission.submittedAt.toISOString().split("T")[0]
    : "";

  const deadlineDate = assignment.deadline
    ? assignment.deadline.toISOString().split("T")[0]
    : "";

  const sheet1Data = [
    ["Training Name", assignment.course?.title || ""],
    ["Assignment Title", assignment.title],
    ["Deadline", deadlineDate],
    [],
    ["Participant", "Submitted On", "Status", "Marks"],
    [
      student.fullName || "",
      submittedDate,
      submission?.status || "pending",
      submission?.score || "",
    ],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);

  const sheet2Data = [
    ["Training Name", assignment.course?.title || ""],
    ["Participant", "Submitted On", "Status", "Marks"],
    [
      student.fullName || "",
      submittedDate,
      submission?.status || "pending",
      submission?.score || "",
    ],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, "Submission");
  XLSX.utils.book_append_sheet(wb, ws2, "Summary Report");

  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const fileName = `Assignment_${assignmentId}_Student_${studentId}.xlsx`;
  const filePath = path.join(tempDir, fileName);

  XLSX.writeFile(wb, filePath);

  res.download(filePath, fileName, (err) => {
    if (err) console.log("Excel download error:", err);
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

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  const submission = assignment.submissions.id(submissionId);
  if (!submission) return sendError(res, 404, false, "Submission not found");

  if (req.files) {
    submission.mistakePhotos.push(
      ...req.files.map((f) => path.basename(f.path))
    );
  }

  if (score !== undefined) submission.score = score;
  if (status) submission.status = status;
  if (remarks) submission.remarks = remarks;

  await assignment.save();

  return sendResponse(res, 200, true, "Graded successfully", submission);
});

exports.resubmitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId, submissionId, remarks, githubLink, status } = req.body;

  if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
    return sendError(res, 400, false, "Valid assignmentId is required");
  }
  if (!submissionId || !mongoose.Types.ObjectId.isValid(submissionId)) {
    return sendError(res, 400, false, "Valid submissionId is required");
  }

  if (
    (!req.files || req.files.length === 0) &&
    (!githubLink || githubLink.trim() === "")
  ) {
    return sendError(
      res,
      400,
      false,
      "Please upload a file or provide GitHub link"
    );
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) return sendError(res, 404, false, "Assignment not found");

  const submission = assignment.submissions.id(submissionId);
  if (!submission) return sendError(res, 404, false, "Submission not found");

  if (req.files && req.files.length > 0) {
    const uploadedFiles = req.files.map((f) => path.basename(f.path));
    submission.files.push(...uploadedFiles);
  }

  if (githubLink && githubLink.trim() !== "") {
    submission.files.push(githubLink.trim());
  }

  submission.remarks = remarks || submission.remarks;
  submission.status = status || submission.status;
  submission.submittedAt = new Date();

  await assignment.save();

  return sendResponse(
    res,
    200,
    true,
    "Assignment re-submitted successfully",
    submission
  );
});

exports.cloneAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.body;

  const original = await Assignment.findById(assignmentId);
  if (!original) return sendError(res, 404, false, "Not found");

  const clone = await Assignment.create({
    course: original.course,
    chapter: original.chapter || null,
    batches: original.batches,
    title: original.title + " (Copy)",
    description: original.description,
    fileUrl: original.fileUrl,
    deadline: original.deadline,
    status: original.status,
    isActive: original.isActive,
    submissions: [],
  });

  if (original.chapter) {
    await Chapter.findByIdAndUpdate(original.chapter, {
      $push: { assignments: clone._id },
    });
  }

  return sendResponse(res, 201, true, "Cloned successfully", clone);
});
