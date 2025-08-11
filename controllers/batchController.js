const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const Batch = require("../models/Batch");
const Student = require("../models/Student");
const { sendResponse, sendError } = require("../utils/apiResponse");

// ✅ Create a new batch
exports.createBatch = asyncHandler(async (req, res) => {
  const {
    batchName,
    timing,
    mode,
    coursesAssigned,
    trainersAssigned,
    additionalNotes,
  } = req.body;

  const batch = await Batch.create({
    batchName,
    timing,
    mode,
    coursesAssigned: Array.isArray(coursesAssigned)
      ? coursesAssigned
      : coursesAssigned?.split(","),
    trainersAssigned: Array.isArray(trainersAssigned)
      ? trainersAssigned
      : trainersAssigned?.split(","),
    additionalNotes,
  });

  return sendResponse(res, 201, true, "Batch created successfully", batch);
});

// ✅ Get all batches with aggregation
exports.getAllBatches = asyncHandler(async (req, res) => {
  const batches = await Batch.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "coursesAssigned",
        foreignField: "_id",
        as: "coursesAssigned",
      },
    },
    {
      $lookup: {
        from: "trainers",
        localField: "trainersAssigned",
        foreignField: "_id",
        as: "trainersAssigned",
      },
    },
    {
      $project: {
        batchName: 1,
        timing: 1,
        mode: 1,
        additionalNotes: 1,
        studentCount: 1,
        coursesAssigned: { _id: 1, title: 1 },
        trainersAssigned: { _id: 1, fullName: 1, email: 1 },
      },
    },
  ]);

  return sendResponse(res, 200, true, "Batches fetched successfully", batches);
});

// ✅ Get batch by ID using aggregation
exports.getBatchById = asyncHandler(async (req, res) => {
  const batchId = new mongoose.Types.ObjectId(req.params.id);

  const batches = await Batch.aggregate([
    { $match: { _id: batchId } },
    {
      $lookup: {
        from: "courses",
        localField: "coursesAssigned",
        foreignField: "_id",
        as: "coursesAssigned",
      },
    },
    {
      $lookup: {
        from: "trainers",
        localField: "trainersAssigned",
        foreignField: "_id",
        as: "trainersAssigned",
      },
    },
    {
      $project: {
        batchName: 1,
        timing: 1,
        mode: 1,
        additionalNotes: 1,
        studentCount: 1,
        coursesAssigned: { _id: 1, title: 1 },
        trainersAssigned: { _id: 1, fullName: 1, email: 1 },
      },
    },
  ]);

  if (!batches || batches.length === 0) {
    return sendError(res, 404, false, "Batch not found");
  }

  return sendResponse(res, 200, true, "Batch fetched successfully", batches[0]);
});

// ✅ Get batches by course and student using aggregation
exports.getBatchesByCourseAndStudent = asyncHandler(async (req, res) => {
  const { courseId, studentId } = req.body;

  if (!courseId || !studentId) {
    return sendError(
      res,
      400,
      false,
      "Both courseId and studentId are required"
    );
  }

  const batches = await Batch.aggregate([
    { $match: { coursesAssigned: new mongoose.Types.ObjectId(courseId) } },
    {
      $lookup: {
        from: "courses",
        localField: "coursesAssigned",
        foreignField: "_id",
        as: "coursesAssigned",
      },
    },
    {
      $lookup: {
        from: "trainers",
        localField: "trainersAssigned",
        foreignField: "_id",
        as: "trainersAssigned",
      },
    },
    {
      $project: {
        batchName: 1,
        timing: 1,
        mode: 1,
        coursesAssigned: { _id: 1, title: 1 },
        trainersAssigned: { _id: 1, fullName: 1, email: 1 },
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    studentId,
    courseId,
    count: batches.length,
    batches,
  });
});

// ✅ Assign student to batch
exports.assignStudentToBatch = asyncHandler(async (req, res) => {
  const { courseId, studentId } = req.body;

  if (!courseId || !studentId) {
    return sendError(res, 400, false, "courseId and studentId are required");
  }

  const batch = await Batch.findOne({ coursesAssigned: courseId });
  if (!batch)
    return sendError(res, 404, false, "Batch not found for the given courseId");

  const student = await Student.findById(studentId);
  if (!student) return sendError(res, 404, false, "Student not found");

  if (!batch.students) batch.students = [];

  const alreadyAdded = batch.students.some(
    (s) => s.studentId.toString() === studentId
  );
  if (alreadyAdded)
    return sendError(res, 400, false, "Student already assigned to this batch");

  batch.students.push({
    studentId: student._id,
    fullName: student.fullName,
    email: student.email,
  });

  batch.studentCount = batch.students.length;
  await batch.save();

  return sendResponse(
    res,
    200,
    true,
    "Student assigned to batch successfully",
    batch
  );
});

// ✅ Get batches for a specific student using aggregation
exports.getBatchesForStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const batches = await Batch.aggregate([
    {
      $match: { "students.studentId": new mongoose.Types.ObjectId(studentId) },
    },
    {
      $lookup: {
        from: "courses",
        localField: "coursesAssigned",
        foreignField: "_id",
        as: "coursesAssigned",
      },
    },
    {
      $lookup: {
        from: "trainers",
        localField: "trainersAssigned",
        foreignField: "_id",
        as: "trainersAssigned",
      },
    },
    {
      $project: {
        batchName: 1,
        timing: 1,
        mode: 1,
        coursesAssigned: { _id: 1, title: 1 },
        trainersAssigned: { _id: 1, fullName: 1, email: 1 },
      },
    },
  ]);

  if (!batches || batches.length === 0) {
    return sendError(res, 404, false, "No batches found for this student.");
  }

  return sendResponse(res, 200, true, "Batches fetched successfully", batches);
});

// ✅ Update batch
exports.updateBatch = asyncHandler(async (req, res) => {
  const updated = await Batch.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!updated) return sendError(res, 404, false, "Batch not found");

  return sendResponse(res, 200, true, "Batch updated successfully", updated);
});

exports.deleteBatch = asyncHandler(async (req, res) => {
  const deleted = await Batch.findByIdAndDelete(req.params.id);

  if (!deleted) return sendError(res, 404, false, "Batch not found");

  return sendResponse(res, 200, true, "Batch deleted successfully");
});
