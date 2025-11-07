const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Meeting = require("../models/Meeting");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.markAttendance = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const { attendees } = req.body;

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) return sendError(res, 404, false, "Meeting not found");

  let existingAttendance = await Attendance.findOne({ meeting: meetingId });

  if (existingAttendance) {
    return sendError(
      res,
      400,
      false,
      "Attendance already marked for this meeting"
    );
  }

  const newAttendance = await Attendance.create({
    meeting: meetingId,
    batch: meeting.batch,
    trainer: meeting.trainer,
    course: meeting.course,
    attendees: attendees.map((a) => ({
      student: a.studentId,
      batch: a.batchId || meeting.batch,
      present: a.present,
    })),
    markedByTrainer: true,
    markedAt: new Date(),
    isActive: true,
  });

  const populatedAttendance = await Attendance.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(newAttendance._id) } },
    {
      $lookup: {
        from: "students",
        localField: "attendees.student",
        foreignField: "_id",
        as: "students",
      },
    },
    {
      $lookup: {
        from: "batches",
        localField: "batch",
        foreignField: "_id",
        as: "batch",
      },
    },
    { $unwind: "$batch" },
    {
      $lookup: {
        from: "trainers",
        localField: "trainer",
        foreignField: "_id",
        as: "trainer",
      },
    },
    { $unwind: "$trainer" },
  ]);

  return sendResponse(
    res,
    200,
    true,
    "Attendance marked successfully",
    populatedAttendance[0]
  );
});

exports.getAllAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.aggregate([
    {
      $lookup: {
        from: "meetings",
        localField: "meeting",
        foreignField: "_id",
        as: "meeting",
      },
    },
    { $unwind: "$meeting" },
    {
      $lookup: {
        from: "students",
        localField: "student",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
    {
      $lookup: {
        from: "batches",
        localField: "batch",
        foreignField: "_id",
        as: "batch",
      },
    },
    { $unwind: "$batch" },
    {
      $lookup: {
        from: "trainers",
        localField: "trainer",
        foreignField: "_id",
        as: "trainer",
      },
    },
    { $unwind: "$trainer" },
    { $sort: { createdAt: -1 } },
  ]);

  return sendResponse(res, 200, "All attendance records fetched", records);
});

exports.getAttendanceByMeeting = asyncHandler(async (req, res) => {
  const meetingId = new mongoose.Types.ObjectId(req.params.meetingId);

  const records = await Attendance.aggregate([
    { $match: { meeting: meetingId } },
    {
      $lookup: {
        from: "students",
        localField: "student",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
  ]);

  if (!records.length)
    return sendError(res, 404, "No attendance found for this meeting");

  const presentCount = records.filter((r) => r.present).length;
  const absentCount = records.filter((r) => !r.present).length;

  return sendResponse(res, 200, "Attendance fetched by meeting", {
    total: records.length,
    presentCount,
    absentCount,
    records,
  });
});

exports.getAttendanceByBatch = asyncHandler(async (req, res) => {
  const batchId = new mongoose.Types.ObjectId(req.params.batchId);

  const records = await Attendance.aggregate([
    { $match: { batch: batchId } },
    {
      $lookup: {
        from: "meetings",
        localField: "meeting",
        foreignField: "_id",
        as: "meeting",
      },
    },
    { $unwind: "$meeting" },
    {
      $lookup: {
        from: "students",
        localField: "student",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
  ]);

  const presentCount = records.filter((r) => r.present).length;
  const absentCount = records.filter((r) => !r.present).length;

  return sendResponse(res, 200, "Attendance fetched by batch", {
    total: records.length,
    presentCount,
    absentCount,
    records,
  });
});

exports.getAttendanceByStudent = asyncHandler(async (req, res) => {
  const studentId = new mongoose.Types.ObjectId(req.params.studentId);

  const records = await Attendance.aggregate([
    { $match: { student: studentId } },
    {
      $lookup: {
        from: "meetings",
        localField: "meeting",
        foreignField: "_id",
        as: "meeting",
      },
    },
    { $unwind: "$meeting" },
    {
      $lookup: {
        from: "batches",
        localField: "batch",
        foreignField: "_id",
        as: "batch",
      },
    },
    { $unwind: "$batch" },
  ]);

  if (!records.length)
    return sendError(res, 404, "No attendance found for this student");

  const presentCount = records.filter((r) => r.present).length;
  const absentCount = records.filter((r) => !r.present).length;

  return sendResponse(res, 200, "Attendance fetched by student", {
    total: records.length,
    presentCount,
    absentCount,
    records,
  });
});

exports.getAttendanceStats = asyncHandler(async (req, res) => {
  const stats = await Attendance.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        presentCount: { $sum: { $cond: [{ $eq: ["$present", true] }, 1, 0] } },
        absentCount: { $sum: { $cond: [{ $eq: ["$present", false] }, 1, 0] } },
      },
    },
  ]);

  const result = stats[0] || { total: 0, presentCount: 0, absentCount: 0 };

  return sendResponse(
    res,
    200,
    "Attendance summary fetched successfully",
    result
  );
});

exports.deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findByIdAndDelete(req.params.id);
  attendance.isActive = false;
  await attendance.save();
  if (!attendance) return sendError(res, 404, "Attendance record not found");

  return sendResponse(res, 200, "Attendance deleted successfully", null);
});
