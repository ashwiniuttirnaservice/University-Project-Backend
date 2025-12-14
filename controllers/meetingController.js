const mongoose = require("mongoose");
const Meeting = require("../models/Meeting");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const Batch = require("../models/Batch");
exports.createMeeting = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    meetingDescription,
    platform,
    meetingLink,
    meetingId,
    meetingPassword,
    batch,
    trainer,
    course,
    startTime,
    endTime,
    recordingUrl,
    notification,
  } = req.body;

  const duration =
    startTime && endTime
      ? Math.round((new Date(endTime) - new Date(startTime)) / 60000)
      : null;

  const meeting = await Meeting.create({
    title,
    description,
    meetingDescription,
    platform,
    meetingLink,
    meetingId,
    meetingPassword,
    batch,
    trainer,
    course,
    startTime,
    endTime,
    duration,
    recordingUrl,
    notification,
  });

  await Batch.findByIdAndUpdate(batch, {
    $addToSet: { meetings: meeting._id },
  });

  return sendResponse(res, 201, true, "Meeting created successfully", meeting);
});

exports.getAllMeetings = asyncHandler(async (req, res) => {
  const baseFilter =
    req.roleFilter && Object.keys(req.roleFilter).length > 0
      ? { ...req.roleFilter, isActive: true }
      : { isActive: true };

  const meetings = await Meeting.find(baseFilter)
    .populate({
      path: "batch",
      model: "Batch",
    })
    .populate({
      path: "trainer",
      model: "Trainer",
    })
    .populate({
      path: "course",
      model: "Course",
    })
    .sort({ createdAt: -1 });

  return sendResponse(
    res,
    200,
    true,
    "Meetings fetched successfully",
    meetings
  );
});

const Attendance = require("../models/Attendance");

exports.getMeetingById = asyncHandler(async (req, res) => {
  const meetingId = new mongoose.Types.ObjectId(req.params.id);
  const student = req.Student?._id;

  const meeting = await Meeting.aggregate([
    { $match: { _id: meetingId, isActive: true } },
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
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
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

  if (!meeting.length) {
    return sendError(res, 404, false, "Meeting not found");
  }

  let meetingData = meeting[0];

  const attendance = await Attendance.findOne({
    meeting: meetingId,
    "attendees.student": student,
  });

  meetingData.attendanceStatus = attendance ? "already done" : "not marked";

  return sendResponse(
    res,
    200,
    true,
    "Meeting fetched successfully",
    meetingData
  );
});

exports.updateMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!meeting) return sendError(res, 404, "Meeting not found");

  return sendResponse(res, 200, "Meeting updated successfully", meeting);
});

exports.deleteMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findByIdAndDelete(req.params.id);

  meeting.isActive = false;
  await meeting.save();
  if (!meeting) return sendError(res, 404, "Meeting not found");

  return sendResponse(res, 200, "Meeting deleted successfully", null);
});

exports.getMeetingsByBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(batchId)) {
    return sendError(res, 400, false, "Invalid batch ID format");
  }

  const meetings = await Meeting.aggregate([
    {
      $match: {
        batch: new mongoose.Types.ObjectId(batchId),
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "attendances",
        localField: "_id",
        foreignField: "meeting",
        as: "attendanceRecords",
      },
    },
    {
      $addFields: {
        attendanceStatus: {
          $cond: [
            { $gt: [{ $size: "$attendanceRecords" }, 0] },
            "Attendance already marked",
            "Attendance not marked",
          ],
        },
      },
    },
    {
      $lookup: {
        from: "batches",
        localField: "batch",
        foreignField: "_id",
        as: "batchDetails",
      },
    },
    {
      $lookup: {
        from: "trainers",
        localField: "trainer",
        foreignField: "_id",
        as: "trainerDetails",
      },
    },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        meetingDescription: 1,
        platform: 1,
        meetingLink: 1,
        meetingId: 1,
        meetingPassword: 1,
        startTime: 1,
        endTime: 1,
        duration: 1,
        recordingUrl: 1,
        status: 1,
        notification: 1,
        isActive: 1,
        attendanceStatus: 1,
        batchDetails: { $arrayElemAt: ["$batchDetails", 0] },
        trainerDetails: { $arrayElemAt: ["$trainerDetails", 0] },
        courseDetails: { $arrayElemAt: ["$courseDetails", 0] },
      },
    },
    { $sort: { startTime: -1 } },
  ]);

  if (!meetings || meetings.length === 0) {
    return sendError(res, 404, false, "No meetings found for this batch");
  }

  return sendResponse(
    res,
    200,
    true,
    "Meetings fetched successfully",
    meetings
  );
});
