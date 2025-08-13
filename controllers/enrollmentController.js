const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment.js");
const Course = require("../models/Course");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// Enroll in a course
exports.enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId, studentId } = req.body;
  const userId = req.user.id;

  if (!courseId || !studentId) {
    return sendError(res, 400, false, "Course ID and Student ID are required");
  }

  const course = await Course.findById(courseId);
  if (!course) return sendError(res, 404, false, "Course not found");

  const existing = await Enrollment.findOne({
    user: userId,
    course: courseId,
    studentId,
  });
  if (existing)
    return sendError(res, 400, false, "Already enrolled in this course");

  const enrollment = await Enrollment.create({
    user: userId,
    course: courseId,
    studentId,
  });

  const populated = await Enrollment.findById(enrollment._id)
    .populate("user", "firstName lastName email")
    .populate("course", "title description");

  return sendResponse(res, 201, true, "Enrolled successfully", populated);
});

// Get logged-in user's enrollments using aggregation
exports.getMyEnrollments = asyncHandler(async (req, res) => {
  const studentId = req.user.studentId;

  const enrollments = await Enrollment.aggregate([
    { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
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
        course: {
          title: "$courseDetails.title",
          description: "$courseDetails.description",
          instructor: "$courseDetails.instructor",
          youtubeVideos: "$courseDetails.youtubeVideos",
          notes: "$courseDetails.notes",
          branch: "$branchDetails.name",
        },
      },
    },
    { $sort: { enrolledAt: -1 } },
  ]);

  return sendResponse(res, 200, true, "My enrollments fetched", enrollments);
});

// Mark content as complete
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

// Mark content as incomplete
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

// Admin: Get all enrollments using aggregation
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

// Admin: Get single enrollment using aggregation
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

// Unenroll from course
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
  const { firstName, middleName, lastName, mobile, email, collegeName } =
    req.body;

  if (!firstName || !lastName || !mobile || !email || !collegeName) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be filled.",
    });
  }

  const enrollment = await Enrollment.create({
    firstName,
    middleName,
    lastName,
    mobile,
    email,
  });

  res.status(201).json({
    success: true,
    message: "Enrollment created successfully",
    data: enrollment,
  });
});
