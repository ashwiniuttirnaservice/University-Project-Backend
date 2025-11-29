const Prerequisite = require("../models/Prerequisite");
const PrerequisiteProgress = require("../models/PrerequisiteProgress");
const Student = require("../models/Student");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const ExcelJS = require("exceljs");
// const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");

exports.updatePrerequisiteProgress = asyncHandler(async (req, res) => {
  const { prerequisiteId, studentId, status } = req.body;

  if (!prerequisiteId || !studentId || !status) {
    return sendError(res, 400, false, "Missing required fields");
  }

  const existing = await PrerequisiteProgress.findOne({
    prerequisiteId,
    studentId,
  });

  if (existing) {
    existing.status = status;
    existing.completedAt = status === "completed" ? new Date() : null;
    await existing.save();
    return sendResponse(res, 200, true, "Progress updated", existing);
  }
  const progress = await PrerequisiteProgress.create({
    prerequisiteId,
    studentId,
    status,
    completedAt: status === "completed" ? new Date() : null,
  });

  return sendResponse(res, 201, true, "Progress created", progress);
});

exports.getCoursePrerequisiteProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const prerequisites = await Prerequisite.find({ courseId, isActive: true });
  const prerequisiteIds = prerequisites.map((p) => p._id);

  const progress = await PrerequisiteProgress.aggregate([
    { $match: { prerequisiteId: { $in: prerequisiteIds } } },
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
    {
      $lookup: {
        from: "prerequisites",
        localField: "prerequisiteId",
        foreignField: "_id",
        as: "prerequisite",
      },
    },
    { $unwind: "$prerequisite" },
    { $sort: { "student.fullName": 1 } },
  ]);

  return sendResponse(res, 200, true, "Course prerequisite progress", progress);
});

exports.generatePrerequisiteExcelReport = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const prerequisites = await Prerequisite.find({ courseId, isActive: true });
  const prerequisiteIds = prerequisites.map((p) => p._id);

  const progress = await PrerequisiteProgress.aggregate([
    { $match: { prerequisiteId: { $in: prerequisiteIds } } },
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
  ]);

  let grouped = {};

  progress.forEach((item) => {
    if (!grouped[item.studentId]) {
      grouped[item.studentId] = {
        student: item.student.fullName,
        videos: {},
        total: prerequisites.length,
        completed: 0,
      };
    }

    const preIndex =
      prerequisites.findIndex((p) => p._id.equals(item.prerequisiteId)) + 1;

    grouped[item.studentId].videos[`Video ${preIndex}`] =
      item.status === "completed" ? "100%" : "0%";

    if (item.status === "completed") {
      grouped[item.studentId].completed++;
    }
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Prerequisite Report");

  let header = ["Participant"];

  prerequisites.forEach((_, i) => header.push(`Video ${i + 1}`));

  header.push("Completion %", "Status");

  sheet.addRow(header);

  Object.values(grouped).forEach((row) => {
    const data = [row.student];

    prerequisites.forEach((_, i) => {
      data.push(row.videos[`Video ${i + 1}`] || "0%");
    });

    const percent = Math.round((row.completed / row.total) * 100);

    data.push(percent + "%");
    data.push(percent === 100 ? "Completed" : "Pending");

    sheet.addRow(data);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");

  await workbook.xlsx.write(res);
  res.end();
});

// exports.generatePrerequisitePdfReport = asyncHandler(async (req, res) => {
//   const { courseId } = req.params;

//   const prerequisites = await Prerequisite.find({ courseId, isActive: true });
//   const prerequisiteIds = prerequisites.map((p) => p._id);

//   const progress = await PrerequisiteProgress.aggregate([
//     { $match: { prerequisiteId: { $in: prerequisiteIds } } },
//     {
//       $lookup: {
//         from: "students",
//         localField: "studentId",
//         foreignField: "_id",
//         as: "student",
//       },
//     },
//     { $unwind: "$student" },
//   ]);

//   let grouped = {};

//   progress.forEach((item) => {
//     if (!grouped[item.studentId]) {
//       grouped[item.studentId] = {
//         student: item.student.fullName,
//         videos: {},
//         total: prerequisites.length,
//         completed: 0,
//       };
//     }

//     const preIndex =
//       prerequisites.findIndex((p) => p._id.equals(item.prerequisiteId)) + 1;

//     grouped[item.studentId].videos[`Video ${preIndex}`] =
//       item.status === "completed" ? "100%" : "0%";

//     if (item.status === "completed") grouped[item.studentId].completed++;
//   });

//   const doc = new PDFDocument({ margin: 30 });

//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

//   doc.pipe(res);

//   doc.fontSize(18).text("Prerequisite Progress Report", { underline: true });
//   doc.moveDown();

//   Object.values(grouped).forEach((row) => {
//     doc.fontSize(14).text(`Participant: ${row.student}`);

//     prerequisites.forEach((_, i) => {
//       doc.text(`Video ${i + 1}: ${row.videos[`Video ${i + 1}`] || "0%"}`);
//     });

//     const percent = Math.round((row.completed / row.total) * 100);

//     doc.text(`Completion: ${percent}%`);
//     doc.text(`Status: ${percent === 100 ? "Completed" : "Pending"}`);
//     doc.moveDown();
//   });

//   doc.end();
// });
