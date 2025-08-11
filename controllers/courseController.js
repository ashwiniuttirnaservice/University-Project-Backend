const Course = require("../models/Course");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// @desc    Create a new course
// @route   POST /api/courses
exports.createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    duration,
    branch,
    rating,
    enrolledCount,
    overview,
    learningOutcomes,
    benefits,
    keyFeatures,
    features,
    trainer,
    isActive,
  } = req.body;

  const course = await Course.create({
    title,
    description,
    duration,
    branch,
    rating,
    enrolledCount,
    overview,
    learningOutcomes,
    benefits,
    keyFeatures,
    features,
    trainer,
    isActive,
  });

  return sendResponse(res, 201, true, "Course created successfully", course);
});

// @desc    Get all courses
// @route   GET /api/courses
exports.getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate("branch").populate("trainer");
  return sendResponse(res, 200, true, "All courses fetched", courses);
});

// @desc    Get a single course by ID
// @route   GET /api/courses/:id
exports.getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate(
    "trainer",
    "highestQualification fullName profilePhotoTrainer"
  );

  if (!course) {
    return sendError(res, 404, false, "Course not found");
  }

  return sendResponse(res, 200, true, "Course fetched", course);
});

// @desc    Update course
// @route   PUT /api/courses/:id
exports.updateCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    duration,
    branch,
    rating,
    enrolledCount,
    overview,
    learningOutcomes,
    benefits,
    keyFeatures,
    features,
    trainer,
    isActive,
  } = req.body;

  const course = await Course.findByIdAndUpdate(
    req.params.id,
    {
      title,
      description,
      duration,
      branch,
      rating,
      enrolledCount,
      overview,
      learningOutcomes,
      benefits,
      keyFeatures,
      features,
      trainer,
      isActive,
    },
    { new: true, runValidators: true }
  );

  if (!course) {
    return sendError(res, 404, false, "Course not found");
  }

  return sendResponse(res, 200, true, "Course updated successfully", course);
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    return sendError(res, 404, false, "Course not found");
  }

  return sendResponse(res, 200, true, "Course deleted", null);
});

exports.getAllCourse = asyncHandler(async (req, res) => {
  const courses = await Course.find({}).select(
    "title duration  features.certificate features.codingExercises features.recordedLectures"
  );

  return res.status(200).json({
    success: true,
    message: "Courses fetched successfully",
    data: courses,
  });
});
