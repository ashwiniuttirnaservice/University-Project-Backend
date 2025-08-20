const Course = require("../models/Course");
const Trainer = require("../models/Trainer");
const Note = require("../models/Note");
const VideoLecture = require("../models/Video");
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

  const course = await Course.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },

    {
      $lookup: {
        from: "trainers",
        localField: "_id",
        foreignField: "courses",
        as: "trainer",
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        duration: 1,
        branch: 1,
        rating: 1,
        enrolledCount: 1,
        overview: 1,
        learningOutcomes: 1,
        benefits: 1,
        keyFeatures: 1,
        features: 1,
        videolectures: 1,
        notes: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        trainer: {
          $map: {
            input: "$trainer",
            as: "t",
            in: {
              _id: "$$t._id",
              fullName: "$$t.fullName",
              highestQualification: "$$t.highestQualification",
              profilePhotoTrainer: "$$t.profilePhotoTrainer",
            },
          },
        },
      },
    },

    {
      $lookup: {
        from: "videolectures",
        localField: "_id",
        foreignField: "course",
        as: "videolectures",
      },
    },
    {
      $addFields: {
        videolectures: {
          $map: {
            input: "$videolectures",
            as: "v",
            in: {
              _id: "$$v._id",
              type: "$$v.type",
              title: "$$v.title",
              contentUrl: "$$v.contentUrl",
              duration: "$$v.duration",
              description: "$$v.description",
              createdAt: "$$v.createdAt",
              updatedAt: "$$v.updatedAt",
            },
          },
        },
      },
    },

    {
      $lookup: {
        from: "notes",
        localField: "_id",
        foreignField: "course",
        as: "notes",
      },
    },
    {
      $addFields: {
        notes: {
          $map: {
            input: "$notes",
            as: "n",
            in: {
              _id: "$$n._id",
              title: "$$n.title",
              content: "$$n.content",
              file: "$$n.file",
              type: "$$n.type",
              duration: "$$n.duration",
              uploadedAt: "$$n.uploadedAt",
            },
          },
        },
      },
    },
  ]);

  if (!course || course.length === 0) {
    return sendError(res, 404, false, "Course not found");
  }

  const formattedCourse = {
    ...course[0],
    trainer:
      Array.isArray(course[0].trainer) && course[0].trainer.length === 1
        ? course[0].trainer[0]
        : course[0].trainer,
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
