const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const Attendance = require("../models/Attendance");
const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const Feedback = require("../models/Feedback");
const Test = require("../models/Test");
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// -------------------- Attendance Report --------------------
exports.attendanceReport = asyncHandler(async (req, res) => {
  const { batchId, start, end } = req.query;

  if (!batchId || !start || !end)
    return sendError(res, 400, false, "batchId, start and end date required");

  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  const report = await Attendance.aggregate([
    {
      $match: {
        batch: new mongoose.Types.ObjectId(batchId),
        markedAt: { $gte: startDate, $lte: endDate },
      },
    },
    { $unwind: "$attendees" },
    {
      $lookup: {
        from: "enrollments",
        localField: "attendees.student",
        foreignField: "_id",
        as: "studentInfo",
      },
    },
    { $unwind: "$studentInfo" },
    {
      $project: {
        participant: "$studentInfo.fullName",
        date: "$markedAt",
        status: "$attendees.present",
      },
    },
    { $sort: { date: 1 } },
  ]);

  return sendResponse(res, 200, true, "Attendance report fetched", report);
});

exports.downloadAttendanceExcel = asyncHandler(async (req, res) => {
  const { batchId, start, end } = req.query;

  if (!batchId || !start || !end)
    return sendError(res, 400, false, "batchId, start and end date required");

  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  const report = await Attendance.aggregate([
    {
      $match: {
        batch: new mongoose.Types.ObjectId(batchId),
        markedAt: { $gte: startDate, $lte: endDate },
      },
    },
    { $unwind: "$attendees" },
    {
      $lookup: {
        from: "enrollments",
        localField: "attendees.student",
        foreignField: "_id",
        as: "studentInfo",
      },
    },
    { $unwind: "$studentInfo" },
    {
      $project: {
        Participant: "$studentInfo.fullName",
        Date: "$markedAt",
        Status: "$attendees.present",
      },
    },
    { $sort: { Date: 1 } },
  ]);

  if (report.length === 0)
    return sendError(res, 400, false, "No attendance data found");

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(report);
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");

  const fileName = `Attendance_Report_${batchId}.xlsx`;
  const filePath = path.join(__dirname, "../temp", fileName);

  if (!fs.existsSync(path.join(__dirname, "../temp")))
    fs.mkdirSync(path.join(__dirname, "../temp"));

  XLSX.writeFile(wb, filePath);

  res.download(filePath, fileName, (err) => {
    if (err) console.log("Excel download error:", err);
    fs.unlinkSync(filePath);
  });
});

exports.prerequisiteReport = asyncHandler(async (req, res) => {
  const { studentId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(studentId))
    return sendError(res, 400, false, "Invalid student ID");

  const enrollment = await Enrollment.findById(studentId).populate(
    "completedModules"
  );
  if (!enrollment) return sendError(res, 404, false, "Enrollment not found");

  const report = enrollment.completedModules.map((m) => ({
    participant: enrollment.fullName,
    module: m.title,
    status: "Completed",
  }));

  return sendResponse(res, 200, true, "Prerequisite report fetched", report);
});

exports.downloadPrerequisiteExcel = asyncHandler(async (req, res) => {
  const { studentId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(studentId))
    return sendError(res, 400, false, "Invalid student ID");

  const enrollment = await Enrollment.findById(studentId).populate(
    "completedModules"
  );
  if (!enrollment) return sendError(res, 404, false, "Enrollment not found");

  const report = enrollment.completedModules.map((m) => ({
    Participant: enrollment.fullName,
    Module: m.title,
    Status: "Completed",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(report);
  XLSX.utils.book_append_sheet(wb, ws, "Prerequisites");

  const fileName = `Prerequisite_Report_${studentId}.xlsx`;
  const filePath = path.join(__dirname, "../temp", fileName);
  if (!fs.existsSync(path.join(__dirname, "../temp")))
    fs.mkdirSync(path.join(__dirname, "../temp"));
  XLSX.writeFile(wb, filePath);

  res.download(filePath, fileName, (err) => {
    if (err) console.log(err);
    fs.unlinkSync(filePath);
  });
});

exports.preAssessmentReport = asyncHandler(async (req, res) => {
  const { courseId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(courseId))
    return sendError(res, 400, false, "Invalid course ID");

  const report = await Test.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
        type: "pre-assessment",
      },
    },
    {
      $lookup: {
        from: "enrollments",
        localField: "student",
        foreignField: "_id",
        as: "studentInfo",
      },
    },
    { $unwind: "$studentInfo" },
    {
      $project: {
        Participant: "$studentInfo.fullName",
        Assessment: "$title",
        Score: 1,
        MaxMarks: "$totalMarks",
      },
    },
  ]);

  return sendResponse(res, 200, true, "Pre-assessment report", report);
});

exports.downloadPreAssessmentExcel = asyncHandler(async (req, res) => {
  const { courseId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(courseId))
    return sendError(res, 400, false, "Invalid course ID");

  const report = await Test.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
        type: "pre-assessment",
      },
    },
    {
      $lookup: {
        from: "enrollments",
        localField: "student",
        foreignField: "_id",
        as: "studentInfo",
      },
    },
    { $unwind: "$studentInfo" },
    {
      $project: {
        Participant: "$studentInfo.fullName",
        Assessment: "$title",
        Score: 1,
        MaxMarks: "$totalMarks",
      },
    },
  ]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(report);
  XLSX.utils.book_append_sheet(wb, ws, "Pre-Assessment");

  const fileName = `PreAssessment_Report_${courseId}.xlsx`;
  const filePath = path.join(__dirname, "../temp", fileName);
  if (!fs.existsSync(path.join(__dirname, "../temp")))
    fs.mkdirSync(path.join(__dirname, "../temp"));
  XLSX.writeFile(wb, filePath);

  res.download(filePath, fileName, (err) => {
    if (err) console.log(err);
    fs.unlinkSync(filePath);
  });
});

// -------------------- Assignment Report --------------------
exports.assignmentReport = asyncHandler(async (req, res) => {
  const { courseId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(courseId))
    return sendError(res, 400, false, "Invalid course ID");

  const assignments = await Assignment.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    { $unwind: "$submissions" },
    {
      $lookup: {
        from: "enrollments",
        localField: "submissions.student",
        foreignField: "_id",
        as: "studentInfo",
      },
    },
    { $unwind: "$studentInfo" },
    {
      $project: {
        Participant: "$studentInfo.fullName",
        SubmittedOn: "$submissions.submittedAt",
        Status: "$submissions.status",
        File: { $arrayElemAt: ["$submissions.files", 0] },
        Marks: "$submissions.score",
      },
    },
    { $sort: { SubmittedOn: -1 } },
  ]);

  return sendResponse(
    res,
    200,
    true,
    "Assignment evaluation report",
    assignments
  );
});

exports.downloadAssignmentExcel = asyncHandler(async (req, res) => {
  const { courseId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(courseId))
    return sendError(res, 400, false, "Invalid course ID");

  const assignments = await Assignment.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    { $unwind: "$submissions" },
    {
      $lookup: {
        from: "enrollments",
        localField: "submissions.student",
        foreignField: "_id",
        as: "studentInfo",
      },
    },
    { $unwind: "$studentInfo" },
    {
      $project: {
        Participant: "$studentInfo.fullName",
        SubmittedOn: "$submissions.submittedAt",
        Status: "$submissions.status",
        File: { $arrayElemAt: ["$submissions.files", 0] },
        Marks: "$submissions.score",
      },
    },
    { $sort: { SubmittedOn: -1 } },
  ]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(assignments);
  XLSX.utils.book_append_sheet(wb, ws, "Assignments");

  const fileName = `Assignment_Report_${courseId}.xlsx`;
  const filePath = path.join(__dirname, "../temp", fileName);
  if (!fs.existsSync(path.join(__dirname, "../temp")))
    fs.mkdirSync(path.join(__dirname, "../temp"));
  XLSX.writeFile(wb, filePath);

  res.download(filePath, fileName, (err) => {
    if (err) console.log(err);
    fs.unlinkSync(filePath);
  });
});

exports.feedbackReport = asyncHandler(async (req, res) => {
  const { courseId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(courseId))
    return sendError(res, 400, false, "Invalid course ID");

  const report = await Feedback.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: "$course",
        AvgRating: { $avg: "$rating" },
        Feedbacks: { $push: "$comment" },
      },
    },
  ]);

  return sendResponse(res, 200, true, "Feedback summary report", report);
});

exports.downloadFeedbackExcel = asyncHandler(async (req, res) => {
  const { courseId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(courseId))
    return sendError(res, 400, false, "Invalid course ID");

  const report = await Feedback.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: "$course",
        AvgRating: { $avg: "$rating" },
        Feedbacks: { $push: "$comment" },
      },
    },
  ]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(report);
  XLSX.utils.book_append_sheet(wb, ws, "Feedback");

  const fileName = `Feedback_Report_${courseId}.xlsx`;
  const filePath = path.join(__dirname, "../temp", fileName);
  if (!fs.existsSync(path.join(__dirname, "../temp")))
    fs.mkdirSync(path.join(__dirname, "../temp"));
  XLSX.writeFile(wb, filePath);

  res.download(filePath, fileName, (err) => {
    if (err) console.log(err);
    fs.unlinkSync(filePath);
  });
});
