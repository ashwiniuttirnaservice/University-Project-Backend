const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Meeting = require("../models/Meeting");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const Batch = require("../models/Batch");
const Enrollment = require("../models/Enrollment.js");
exports.markAttendance = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  console.log("PARAMS:", req.params);
  const { attendees } = req.body;

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) return sendError(res, 404, false, "Meeting not found");

  const existingAttendance = await Attendance.findOne({ meeting: meetingId });
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

  for (const a of attendees) {
    await Enrollment.findOneAndUpdate(
      { studentId: a.studentId },
      { $push: { attendances: newAttendance._id } },
      { new: true }
    );
  }

  const populated = await Attendance.aggregate([
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
    "Attendance marked & saved to enrollment successfully",
    populated[0]
  );
});

exports.getAllAttendance = asyncHandler(async (req, res) => {
  const filter =
    req.roleFilter && Object.keys(req.roleFilter).length > 0
      ? { ...req.roleFilter, isActive: true }
      : { isActive: true };

  const records = await Attendance.find(filter)
    .populate({
      path: "meeting",
      populate: { path: "course", model: "Course" },
    })
    .populate("batch")
    .populate("trainer")
    .populate({
      path: "attendees.student",
      model: "Student",
    })
    .sort({ createdAt: -1 });

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

exports.getAllAttendance1 = asyncHandler(async (req, res) => {
  const attendance = await Attendance.aggregate([
    {
      $match: { isActive: true },
    },

    {
      $lookup: {
        from: "users",
        localField: "student",
        foreignField: "_id",
        as: "student",
      },
    },
    {
      $unwind: {
        path: "$student",
        preserveNullAndEmptyArrays: true,
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
    {
      $unwind: {
        path: "$batch",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "meetings",
        localField: "meeting",
        foreignField: "_id",
        as: "meeting",
      },
    },
    {
      $unwind: {
        path: "$meeting",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $sort: { createdAt: -1 },
    },
  ]);

  return sendResponse(
    res,
    200,
    true,
    "All attendance records fetched",
    attendance
  );
});

const ExcelJS = require("exceljs");
exports.downloadAttendanceExcel = asyncHandler(async (req, res) => {
  const { batchId, start, end } = req.query;

  if (!batchId || !start || !end) {
    return sendError(
      res,
      400,
      false,
      "BatchId, start date and end date are required."
    );
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  const batch = await Batch.findById(batchId).populate(
    "students.studentId",
    "fullName email"
  );

  if (!batch) return sendError(res, 404, false, "Batch not found");

  const attendanceData = await Attendance.aggregate([
    {
      $match: {
        batch: new mongoose.Types.ObjectId(batchId),
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },

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
        from: "trainers",
        localField: "meeting.trainer",
        foreignField: "_id",
        as: "trainer",
      },
    },
    { $unwind: { path: "$trainer", preserveNullAndEmptyArrays: true } },

    {
      $sort: { "meeting.startTime": 1 },
    },
  ]);

  if (!attendanceData.length) {
    return sendError(
      res,
      404,
      false,
      "No attendance found for selected date range."
    );
  }

  const dateList = attendanceData.map((a) =>
    new Date(a.meeting.startTime).toLocaleDateString("en-IN")
  );

  const workbook = new ExcelJS.Workbook();
  const dailySheet = workbook.addWorksheet("Daily Attendance");

  const info = attendanceData[0];

  dailySheet.addRow(["Program", info.meeting?.title || "N/A"]);
  dailySheet.addRow(["Faculty", info.trainer?.fullName || "N/A"]);
  dailySheet.addRow(["Start Time", batch.time?.start || "N/A"]);
  dailySheet.addRow(["End Time", batch.time?.end || "N/A"]);
  dailySheet.addRow(["Date Range", `${start} to ${end}`]);
  dailySheet.addRow([]);
  dailySheet.addRow([]);

  dailySheet.addRow(["Sl. No", "Full Name", ...dateList]);

  const studentMap = {};
  batch.students.forEach((item) => {
    const stu = item.studentId;
    studentMap[stu._id.toString()] = {
      name: stu.fullName,
      records: new Array(dateList.length).fill("A"),
    };
  });

  attendanceData.forEach((record, dateIndex) => {
    record.attendees.forEach((att) => {
      const stuId = att.student.toString();
      if (studentMap[stuId]) {
        studentMap[stuId].records[dateIndex] = att.present
          ? "P"
          : att.late
          ? "L"
          : "A";
      }
    });
  });

  let i = 1;
  for (let key in studentMap) {
    dailySheet.addRow([i++, studentMap[key].name, ...studentMap[key].records]);
  }

  const summary = workbook.addWorksheet("Summary Report");
  summary.addRow([
    "Participant",
    "Sessions Attended",
    "% Attendance",
    "Status",
  ]);

  for (let key in studentMap) {
    const data = studentMap[key];
    const attended = data.records.filter((x) => x === "P" || x === "L").length;
    const total = data.records.length;
    const percent = ((attended / total) * 100).toFixed(2);

    let status = "Poor";
    if (percent >= 90) status = "Excellent";
    else if (percent >= 70) status = "Good";
    else if (percent >= 50) status = "Average";

    summary.addRow([
      data.name,
      `${attended} / ${total}`,
      `${percent}%`,
      status,
    ]);
  }

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=attendance_${start}_${end}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
});
