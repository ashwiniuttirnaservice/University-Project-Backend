const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment.js");
const Course = require("../models/Course");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const Student = require("../models/Student");

exports.enrollInCourse = asyncHandler(async (req, res) => {
  const { course, studentId } = req.body;

  if (!course || !studentId) {
    return sendError(res, 400, false, "Course ID and Student ID are required");
  }

  const courses = await Course.findById(course);
  if (!courses) return sendError(res, 404, false, "Course not found");

  const existing = await Enrollment.findOne({
    course: courses._id,
    studentId,
  });
  if (existing)
    return sendError(res, 400, false, "Already enrolled in this course");

  const enrollment = await Enrollment.create({
    course: courses._id,
    studentId,
  });

  const populated = await Enrollment.findById(enrollment._id)
    .populate("studentId")
    .populate("course", "title description");

  return sendResponse(res, 201, true, "Enrolled successfully", populated);
});

exports.getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
    {
      $lookup: {
        from: "branches",
        localField: "courseDetails.branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "studentDetails",
      },
    },
    { $unwind: "$studentDetails" },
    {
      $project: {
        _id: 1,
        enrolledAt: 1,
        completedContent: 1,

        student: {
          _id: "$studentDetails._id",
          fullName: "$studentDetails.fullName",
          mobileNo: "$studentDetails.mobileNo",
          email: "$studentDetails.email",
        },

        course: {
          _id: "$courseDetails._id",
          title: "$courseDetails.title",
          description: "$courseDetails.description",
          duration: "$courseDetails.duration",
          overview: "$courseDetails.overview",
          learningOutcomes: "$courseDetails.learningOutcomes",
          benefits: "$courseDetails.benefits",
          keyFeatures: "$courseDetails.keyFeatures",
          features: "$courseDetails.features",
          videolectures: "$courseDetails.videolectures",
          notes: "$courseDetails.notes",
          trainer: "$courseDetails.trainer",
          branch: "$branchDetails.name",
        },
      },
    },
    { $sort: { enrolledAt: -1 } },
  ]);

  return sendResponse(res, 200, true, "All enrollments fetched", enrollments);
});

exports.markContentAsComplete = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { contentId } = req.body;
  const userId = req.user.id;

  if (!contentId) return sendError(res, 400, false, "Content ID is required");

  const enrollment = await Enrollment.findById(enrollmentId).populate("course");
  if (!enrollment) return sendError(res, 404, false, "Enrollment not found");
  if (enrollment.user.toString() !== userId)
    return sendError(res, 403, false, "Unauthorized");

  const validContent = [
    ...enrollment.course.youtubeVideos.map((v) => v._id.toString()),
    ...enrollment.course.notes.map((n) => n._id.toString()),
  ];

  if (!validContent.includes(contentId))
    return sendError(res, 404, false, "Invalid content");

  if (!enrollment.completedContent.includes(contentId)) {
    enrollment.completedContent.push(contentId);
    await enrollment.save();
  }

  return sendResponse(res, 200, true, "Content marked complete", enrollment);
});

exports.markContentAsIncomplete = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { contentId } = req.body;
  const userId = req.user.id;

  if (!contentId) return sendError(res, 400, false, "Content ID is required");

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) return sendError(res, 404, false, "Enrollment not found");
  if (enrollment.user.toString() !== userId)
    return sendError(res, 403, false, "Unauthorized");

  enrollment.completedContent = enrollment.completedContent.filter(
    (id) => id.toString() !== contentId
  );
  await enrollment.save();

  return sendResponse(res, 200, true, "Content marked incomplete", enrollment);
});

exports.getAllEnrollmentsAdmin = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
    {
      $project: {
        _id: 1,
        enrolledAt: 1,
        user: {
          firstName: "$userDetails.firstName",
          lastName: "$userDetails.lastName",
          email: "$userDetails.email",
        },
        course: {
          title: "$courseDetails.title",
        },
      },
    },
    { $sort: { enrolledAt: -1 } },
  ]);

  return sendResponse(res, 200, true, "All enrollments fetched", enrollments);
});

exports.getEnrollmentByIdAdmin = asyncHandler(async (req, res) => {
  const enrollmentId = new mongoose.Types.ObjectId(req.params.id);

  const enrollment = await Enrollment.aggregate([
    { $match: { _id: enrollmentId } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
    {
      $lookup: {
        from: "branches",
        localField: "courseDetails.branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        enrolledAt: 1,
        completedContent: 1,
        user: {
          firstName: "$userDetails.firstName",
          lastName: "$userDetails.lastName",
          email: "$userDetails.email",
          role: "$userDetails.role",
          branch: "$userDetails.branch",
        },
        course: {
          title: "$courseDetails.title",
          description: "$courseDetails.description",
          branch: "$branchDetails.name",
        },
      },
    },
  ]);

  if (!enrollment || enrollment.length === 0) {
    return sendError(res, 404, false, "Enrollment not found");
  }

  return sendResponse(res, 200, true, "Enrollment fetched", enrollment[0]);
});

exports.unenrollFromCourse = asyncHandler(async (req, res) => {
  const enrollmentId = req.params.id;
  const currentUser = req.user;

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) return sendError(res, 404, false, "Enrollment not found");

  if (
    currentUser.role !== "admin" &&
    enrollment.user.toString() !== currentUser.id
  ) {
    return sendError(res, 403, false, "Not authorized to unenroll");
  }

  await enrollment.deleteOne();
  return sendResponse(res, 200, true, "Unenrolled successfully");
});

exports.createEnrollment = asyncHandler(async (req, res) => {
  const { fullName, mobileNo, email, collegeName, course, studentId } =
    req.body;

  if (!mobileNo || !email || !collegeName) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be filled.",
    });
  }

  const enrollment = await Enrollment.create({
    fullName,
    mobileNo,
    email,
    course,
    studentId,
  });

  res.status(201).json({
    success: true,
    message: "Enrollment created successfully",
    data: enrollment,
  });
});
