const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const Batch = require("../models/Batch");
const Student = require("../models/Student");
const { sendResponse, sendError } = require("../utils/apiResponse");
const Trainer = require("../models/Trainer");
const Enrollment = require("../models/Enrollment");
exports.createBatch = asyncHandler(async (req, res) => {
  const {
    batchName,
    time,
    days,
    mode,
    startDate,
    endDate,
    status,
    isEnrolled,
    coursesAssigned,
    trainersAssigned,
    additionalNotes,
  } = req.body;

  const batch = await Batch.create({
    batchName,
    time,
    days,
    mode,
    startDate,
    endDate,
    status,
    isEnrolled,
    coursesAssigned,
    trainersAssigned,
    additionalNotes,
  });

  if (Array.isArray(trainersAssigned)) {
    const updated = await Trainer.updateMany(
      { _id: { $in: trainersAssigned } },
      { $addToSet: { batchIds: batch._id } }
    );

    console.log("Trainers updated:", updated);
  }

  return sendResponse(res, 201, true, "Batch created successfully", batch);
});

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
        time: 1,
        days: 1,
        mode: 1,
        startDate: 1,
        endDate: 1,
        status: 1,
        additionalNotes: 1,
        studentCount: 1,
        coursesAssigned: { _id: 1, title: 1 },
        trainersAssigned: { _id: 1, fullName: 1, email: 1 },
      },
    },
  ]);

  return sendResponse(res, 200, true, "Batches fetched successfully", batches);
});

exports.getBatchesByCourseId = asyncHandler(async (req, res) => {
  const courseId = new mongoose.Types.ObjectId(req.params.courseId);

  const batches = await Batch.aggregate([
    {
      $match: {
        coursesAssigned: courseId,
      },
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
        time: 1,
        days: 1,
        mode: 1,
        startDate: 1,
        endDate: 1,
        status: 1,
        additionalNotes: 1,
        studentCount: 1,
        coursesAssigned: { _id: 1, title: 1 },
        trainersAssigned: { _id: 1, fullName: 1, email: 1 },
      },
    },
  ]);

  if (!batches || batches.length === 0) {
    return sendError(res, 404, false, "No batches found for this course");
  }

  return sendResponse(res, 200, true, "Batches fetched successfully", batches);
});

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
        time: 1,
        days: 1,
        mode: 1,
        startDate: 1,
        endDate: 1,
        status: 1,
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
        time: 1,
        days: 1,
        mode: 1,
        startDate: 1,
        endDate: 1,
        status: 1,
        coursesAssigned: { _id: 1, title: 1 },
        trainersAssigned: { _id: 1, fullName: 1, email: 1 },
      },
    },
  ]);

  return sendResponse(res, 200, true, "Batches fetched successfully", {
    studentId,
    courseId,
    count: batches.length,
    batches,
  });
});

exports.assignStudentToBatch = asyncHandler(async (req, res) => {
  const { batchId, studentId, courseId } = req.body;

  if (!studentId) return sendError(res, 400, false, "studentId is required");

  const student = await Student.findById(studentId);
  if (!student) return sendError(res, 404, false, "Student not found");

  let batch = null;
  if (batchId) {
    batch = await Batch.findById(batchId).populate(
      "coursesAssigned",
      "title duration"
    );
    if (!batch) return sendError(res, 404, false, "Batch not found");

    batch.students = batch.students || [];
    const alreadyAdded = batch.students.some(
      (s) => s.studentId.toString() === studentId
    );
    if (alreadyAdded)
      return sendError(
        res,
        400,
        false,
        "Student already assigned to this batch"
      );

    batch.students.push({
      studentId: student._id,
      fullName: student.fullName,
      email: student.email,
    });

    batch.enrolledIds = batch.enrolledIds || [];
    if (!batch.enrolledIds.includes(student._id))
      batch.enrolledIds.push(student._id);

    batch.studentCount = batch.students.length;
    batch.isEnrolled = true;
    await batch.save();
  }

  // CREATE OR UPDATE ENROLLMENT
  let enrollment = await Enrollment.findOne({ studentId: student._id });
  if (!enrollment) {
    enrollment = new Enrollment({
      studentId: student._id,
      user: student.user || null,
      fullName: student.fullName,
      email: student.email,
      mobileNo: student.mobileNo,
      collegeName: student.collegeName || "",
      enrolledCourses: [],
      enrolledBatches: [], // <--- added
      coursesInterested: [],
    });
  }

  if (batch) {
    // Add batch courses to enrolledCourses
    if (batch.coursesAssigned?.length) {
      enrollment.enrolledCourses = [
        ...new Set([
          ...enrollment.enrolledCourses.map((c) => c.toString()),
          ...batch.coursesAssigned.map((c) => c._id.toString()),
        ]),
      ];
    }

    // ✅ Add batchId to enrolledBatches
    if (!enrollment.enrolledBatches.includes(batch._id)) {
      enrollment.enrolledBatches.push(batch._id);
    }

    // ✅ Remove these courses from coursesInterested if present
    const batchCourseIds =
      batch.coursesAssigned?.map((c) => c._id.toString()) || [];
    enrollment.coursesInterested = (enrollment.coursesInterested || []).filter(
      (c) => !batchCourseIds.includes(c.toString())
    );
  } else if (courseId) {
    // No batch → add to coursesInterested
    if (!enrollment.coursesInterested.includes(courseId)) {
      enrollment.coursesInterested.push(courseId);
    }
  }

  await enrollment.save();

  return sendResponse(
    res,
    200,
    true,
    batch
      ? "Student assigned to batch successfully"
      : "Course added to coursesInterested",
    { batch, enrollment }
  );
});

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
        time: 1,
        days: 1,
        mode: 1,
        startDate: 1,
        endDate: 1,
        status: 1,
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
