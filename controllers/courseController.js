const Course = require("../models/Course");
const Trainer = require("../models/Trainer");
const Note = require("../models/Note");
const VideoLecture = require("../models/Video");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");

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
    fees,
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
    fees,
    trainer,
    isActive,
  });

  return sendResponse(res, 201, true, "Course created successfully", course);
});

exports.getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate("branch").populate("trainer");
  return sendResponse(res, 200, true, "All courses fetched", courses);
});

exports.getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id)
    .populate("trainer")
    .populate("batches")
    .populate("videolectures")
    .populate({
      path: "phases",
      populate: {
        path: "weeks",
        populate: {
          path: "chapters",
          populate: [
            { path: "lectures" }, // Nested Lectures
            { path: "assignments" }, // Nested Assignments
            { path: "notes" }, // Nested Notes
          ],
        },
      },
    })
    .lean();

  if (!course) {
    return sendError(res, 404, false, "Course not found");
  }

  return sendResponse(res, 200, true, "Course fetched", course);
});

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
    fees,
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
      fees,
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
