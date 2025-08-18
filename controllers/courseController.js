const Course = require("../models/Course");

const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");
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

// exports.getCourseById = asyncHandler(async (req, res) => {
//   const courseId = new mongoose.Types.ObjectId(req.params.id);

//   const course = await Course.aggregate([
//     { $match: { _id: courseId } },

//     // Trainer Info
//     {
//       $lookup: {
//         from: "users", // users collection
//         localField: "trainer",
//         foreignField: "_id",
//         as: "trainer",
//         pipeline: [
//           {
//             $project: {
//               highestQualification: 1,
//               fullName: 1,
//               profilePhotoTrainer: 1,
//             },
//           },
//         ],
//       },
//     },
//     { $unwind: { path: "$trainer", preserveNullAndEmptyArrays: true } },

//     // Video Lectures जोडणे
//     {
//       $lookup: {
//         from: "Video", // ✅ check तुझ्या VideoLecture model ची collection
//         localField: "_id",
//         foreignField: "course",
//         as: "videos",
//       },
//     },

//     // Notes जोडणे
//     {
//       $lookup: {
//         from: "notes", // ✅ check तुझ्या Note model ची collection
//         localField: "_id",
//         foreignField: "course",
//         as: "notes",
//       },
//     },
//   ]);

//   if (!course || course.length === 0) {
//     return sendError(res, 404, false, "Course not found");
//   }

//   return sendResponse(res, 200, true, "Course fetched", course[0]);
// });

exports.getCourseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let course = await Course.findById(id)
    .populate({
      path: "trainer",
      select: "highestQualification fullName profilePhotoTrainer",
    })
    .populate({
      path: "videolectures",
      select:
        "_id course type title contentUrl duration description createdAt updatedAt",
    })
    .populate({
      path: "notes",
      select: "_id course title content type duration uploadedAt",
    });

  if (!course) {
    return sendError(res, 404, false, "Course not found");
  }

  // trainer ला object करून द्यायचं (array नको)
  const formattedCourse = {
    ...course.toObject(),
    trainer:
      Array.isArray(course.trainer) && course.trainer.length === 1
        ? course.trainer[0]
        : course.trainer,
  };

  return sendResponse(res, 200, true, "Course fetched", formattedCourse);
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
