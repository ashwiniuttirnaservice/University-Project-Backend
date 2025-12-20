const mongoose = require("mongoose");
const Meeting = require("../models/Meeting");
const Attendance = require("../models/Attendance");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createMeeting = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    platform,
    meetingLink,
    meetingId,
    meetingPassword,
    batch,
    trainer,
    course,
    startDate,
    endDate,
    startTime,
    endTime,
    notification,
  } = req.body;

  if (
    !title ||
    !platform ||
    !meetingLink ||
    !batch ||
    !trainer ||
    !course ||
    !startDate ||
    !endDate ||
    !startTime ||
    !endTime
  ) {
    return sendError(res, 400, false, "Required fields are missing");
  }

  const recurrenceGroupId = new mongoose.Types.ObjectId();
  const meetings = [];

  let current = new Date(startDate);
  const end = new Date(endDate);
  let sessionCounter = 1;

  while (current <= end) {
    const start = new Date(current);
    const endT = new Date(current);

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);

    start.setHours(sh, sm, 0, 0);
    endT.setHours(eh, em, 0, 0);

    // Duration in HH:MM
    const durationMinutes = (endT - start) / (1000 * 60);
    const hours = Math.floor(durationMinutes / 60)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor(durationMinutes % 60)
      .toString()
      .padStart(2, "0");
    const durationString = `${hours}:${minutes}`;

    meetings.push({
      title: `${title} - Session ${sessionCounter}`,
      description,
      platform,
      meetingLink,
      meetingId,
      meetingPassword,
      batch,
      trainer,
      course,
      startTime: start,
      endTime: endT,
      duration: durationString,
      notification,
      isActive: true,
      recurrenceGroupId,
    });

    current.setDate(current.getDate() + 1);
    sessionCounter++;
  }

  const savedMeetings = await Meeting.insertMany(meetings);

  const responseSessions = savedMeetings.map((m) => {
    return {
      _id: m._id,
      title: m.title,
      description: m.description,
      platform: m.platform,
      meetingLink: m.meetingLink,
      meetingId: m.meetingId,
      meetingPassword: m.meetingPassword,
      batch: m.batch,
      trainer: m.trainer,
      course: m.course,
      date: m.startTime.toISOString().split("T")[0],
      startTime: m.startTime.toTimeString().slice(0, 5),
      endTime: m.endTime.toTimeString().slice(0, 5),
      duration: m.duration,
      status: m.status,
      notification: m.notification,
      isActive: m.isActive,
      recurrenceGroupId: m.recurrenceGroupId,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  });

  return sendResponse(
    res,
    201,
    true,
    `${savedMeetings.length} meetings created successfully`,
    {
      recurrenceGroupId,
      totalSessions: savedMeetings.length,
      sessions: responseSessions,
    }
  );
});

exports.getAllMeetings = asyncHandler(async (req, res) => {
  const filter =
    req.roleFilter && Object.keys(req.roleFilter).length
      ? { ...req.roleFilter, isActive: true }
      : { isActive: true };

  const meetings = await Meeting.find(filter)
    .populate("batch")
    .populate("trainer")
    .populate("course")
    .sort({ createdAt: -1 });

  return sendResponse(
    res,
    200,
    true,
    "Meetings fetched successfully",
    meetings
  );
});

// ========================= GET MEETING BY ID =========================
exports.getMeetingById = asyncHandler(async (req, res) => {
  const meetingId = req.params.id;
  const student = req.Student?._id;

  if (!mongoose.Types.ObjectId.isValid(meetingId)) {
    return sendError(res, 400, false, "Invalid meeting ID");
  }

  const meeting = await Meeting.findById(meetingId)
    .populate("batch")
    .populate("trainer")
    .populate("course");

  if (!meeting) return sendError(res, 404, false, "Meeting not found");

  const attendance = await Attendance.findOne({
    meeting: meetingId,
    "attendees.student": student,
  });

  const meetingData = meeting.toObject();
  meetingData.attendanceStatus = attendance ? "already done" : "not marked";

  return sendResponse(
    res,
    200,
    true,
    "Meeting fetched successfully",
    meetingData
  );
});

// ========================= UPDATE MEETING =========================
exports.updateMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!meeting) return sendError(res, 404, false, "Meeting not found");

  return sendResponse(res, 200, true, "Meeting updated successfully", meeting);
});

// ========================= DELETE MEETING (SOFT) =========================
exports.deleteMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return sendError(res, 404, false, "Meeting not found");

  meeting.isActive = false;
  await meeting.save();

  return sendResponse(res, 200, true, "Meeting deleted successfully", null);
});

// ========================= GET MEETINGS BY BATCH =========================
exports.getMeetingsByBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(batchId)) {
    return sendError(res, 400, false, "Invalid batch ID format");
  }

  const meetings = await Meeting.find({ batch: batchId, isActive: true })
    .populate("batch")
    .populate("trainer")
    .populate("course")
    .sort({ startTime: -1 });

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

// ========================= GET RECURRING MEETINGS =========================
exports.getRecurringMeetings = asyncHandler(async (req, res) => {
  const { recurrenceGroupId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(recurrenceGroupId)) {
    return sendError(res, 400, false, "Invalid recurrenceGroupId");
  }

  const meetings = await Meeting.find({ recurrenceGroupId, isActive: true })
    .populate("batch")
    .populate("trainer")
    .populate("course")
    .sort({ startTime: 1 });

  if (!meetings || meetings.length === 0) {
    return sendError(res, 404, false, "No recurring meetings found");
  }

  const response = meetings.map((m) => ({
    _id: m._id,
    title: m.title,
    description: m.description,
    platform: m.platform,
    meetingLink: m.meetingLink,
    meetingId: m.meetingId,
    meetingPassword: m.meetingPassword,
    batch: m.batch,
    trainer: m.trainer,
    course: m.course,
    date: m.startTime.toISOString().split("T")[0],
    startTime: m.startTime.toTimeString().slice(0, 5),
    endTime: m.endTime.toTimeString().slice(0, 5),
    duration: m.duration,
    status: m.status,
    notification: m.notification,
    isActive: m.isActive,
    recurrenceGroupId: m.recurrenceGroupId,
  }));

  return sendResponse(
    res,
    200,
    true,
    "Recurring meetings fetched successfully",
    {
      recurrenceGroupId,
      totalSessions: meetings.length,
      sessions: response,
    }
  );
});
