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

    // ✅ Unwind attendees to access student info
    { $unwind: "$attendees" },

    // ✅ Lookup student details for each attendee
    {
      $lookup: {
        from: "students",
        localField: "attendees.student",
        foreignField: "_id",
        as: "attendees.studentDetails",
      },
    },
    { $unwind: "$attendees.studentDetails" },

    // ✅ Optional: group back if you want one record per attendance
    {
      $group: {
        _id: "$_id",
        meeting: { $first: "$meeting" },
        batch: { $first: "$batch" },
        trainer: { $first: "$trainer" },
        course: { $first: "$course" },
        markedByTrainer: { $first: "$markedByTrainer" },
        markedAt: { $first: "$markedAt" },
        isActive: { $first: "$isActive" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        attendees: { $push: "$attendees" },
      },
    },

    { $sort: { createdAt: -1 } },
  ]);

  return sendResponse(
    res,
    200,
    true,
    "All attendance records fetched",
    records
  );
});

exports.getAttendanceByMeeting = asyncHandler(async (req, res) => {
  const meetingId = new mongoose.Types.ObjectId(req.params.meetingId);

  const records = await Attendance.aggregate([
    { $match: { meeting: meetingId } },

    { $unwind: "$attendees" },

    {
      $lookup: {
        from: "students",
        localField: "attendees.student",
        foreignField: "_id",
        as: "attendees.studentDetails",
      },
    },
    { $unwind: "$attendees.studentDetails" },

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

    {
      $group: {
        _id: "$_id",
        meeting: { $first: "$meeting" },
        batch: { $first: "$batch" },
        trainer: { $first: "$trainer" },
        markedByTrainer: { $first: "$markedByTrainer" },
        markedAt: { $first: "$markedAt" },
        attendees: { $push: "$attendees" },
      },
    },
  ]);

  if (!records.length)
    return sendError(res, 404, false, "No attendance found for this meeting");

  const attendees = records[0].attendees || [];
  const presentCount = attendees.filter((a) => a.present).length;
  const absentCount = attendees.filter((a) => !a.present).length;

  return sendResponse(res, 200, true, "Attendance fetched by meeting", {
    total: attendees.length,
    presentCount,
    absentCount,
    record: records[0],
  });
});

exports.getAttendanceByBatch = asyncHandler(async (req, res) => {
  const batchId = new mongoose.Types.ObjectId(req.params.batchId);

  const records = await Attendance.aggregate([
    { $match: { batch: batchId } },

    { $unwind: "$attendees" },

    {
      $lookup: {
        from: "students",
        localField: "attendees.student",
        foreignField: "_id",
        as: "attendees.studentDetails",
      },
    },
    { $unwind: "$attendees.studentDetails" },

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
      $group: {
        _id: "$_id",
        meeting: { $first: "$meeting" },
        batch: { $first: "$batch" },
        trainer: { $first: "$trainer" },
        markedByTrainer: { $first: "$markedByTrainer" },
        markedAt: { $first: "$markedAt" },
        attendees: { $push: "$attendees" },
      },
    },

    { $sort: { "meeting.date": -1 } },
  ]);

  if (!records.length) {
    return sendError(res, 404, false, "No attendance found for this batch");
  }

  const allAttendees = records.flatMap((r) => r.attendees);
  const presentCount = allAttendees.filter((a) => a.present).length;
  const absentCount = allAttendees.filter((a) => !a.present).length;

  return sendResponse(res, 200, true, "Attendance fetched by batch", {
    total: allAttendees.length,
    presentCount,
    absentCount,
    records,
  });
});

exports.getAttendanceByStudent = asyncHandler(async (req, res) => {
  const studentId = new mongoose.Types.ObjectId(req.params.studentId);

  const records = await Attendance.aggregate([
    { $match: { "attendees.student": studentId } },

    { $unwind: "$attendees" },

    { $match: { "attendees.student": studentId } },

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

    {
      $lookup: {
        from: "trainers",
        localField: "trainer",
        foreignField: "_id",
        as: "trainer",
      },
    },
    { $unwind: "$trainer" },

    {
      $lookup: {
        from: "students",
        localField: "attendees.student",
        foreignField: "_id",
        as: "attendees.studentDetails",
      },
    },
    { $unwind: "$attendees.studentDetails" },

    { $sort: { "meeting.date": -1 } },
  ]);

  if (!records.length)
    return sendError(res, 404, false, "No attendance found for this student");

  const total = records.length;
  const presentCount = records.filter((r) => r.attendees.present).length;
  const absentCount = records.filter((r) => !r.attendees.present).length;

  return sendResponse(res, 200, true, "Attendance fetched by student", {
    total,
    presentCount,
    absentCount,
    records,
  });
});

exports.getAttendanceStats = asyncHandler(async (req, res) => {
  const stats = await Attendance.aggregate([
    {
      $addFields: {
        isPresent: {
          $cond: [
            {
              $or: [
                { $eq: ["$present", true] },
                { $eq: ["$present", "true"] },
                { $eq: ["$present", 1] },
              ],
            },
            true,
            false,
          ],
        },
      },
    },

    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        presentCount: {
          $sum: {
            $cond: [{ $eq: ["$isPresent", true] }, 1, 0],
          },
        },
        absentCount: {
          $sum: {
            $cond: [{ $eq: ["$isPresent", false] }, 1, 0],
          },
        },
      },
    },
  ]);

  const result =
    stats.length > 0
      ? {
          total: stats[0].total,
          presentCount: stats[0].presentCount,
          absentCount: stats[0].absentCount,
        }
      : {
          total: 0,
          presentCount: 0,
          absentCount: 0,
        };

  return sendResponse(
    res,
    200,
    true,
    "Attendance summary fetched successfully",
    result
  );
});

exports.deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findByIdAndDelete(req.params.id);
  attendance.isActive = false;
  await attendance.save();
  if (!attendance)
    return sendError(res, 404, false, "Attendance record not found");

  return sendResponse(res, 200, true, "Attendance deleted successfully", null);
});
