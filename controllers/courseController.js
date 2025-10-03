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

  const course = await Course.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },

    {
      $lookup: {
        from: "trainers",
        localField: "trainer",
        foreignField: "_id",
        as: "trainer",
      },
    },

    {
      $lookup: {
        from: "videolectures",
        localField: "videolectures",
        foreignField: "_id",
        as: "videolectures",
      },
    },

    {
      $lookup: {
        from: "phases",
        localField: "phases",
        foreignField: "_id",
        as: "phases",
        pipeline: [
          {
            $lookup: {
              from: "weeks",
              localField: "weeks",
              foreignField: "_id",
              as: "weeks",
              pipeline: [
                {
                  $lookup: {
                    from: "chapters",
                    localField: "chapters",
                    foreignField: "_id",
                    as: "chapters",
                    pipeline: [
                      {
                        $lookup: {
                          from: "lectures",
                          let: { lectureIds: "$lectures" },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $in: [
                                    "$_id",
                                    { $ifNull: ["$$lectureIds", []] },
                                  ],
                                },
                              },
                            },
                          ],
                          as: "lectures",
                        },
                      },
                      {
                        $lookup: {
                          from: "assignments",
                          let: { assignmentIds: "$assignments" },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $in: [
                                    "$_id",
                                    { $ifNull: ["$$assignmentIds", []] },
                                  ],
                                },
                              },
                            },
                          ],
                          as: "assignments",
                        },
                      },
                      {
                        $lookup: {
                          from: "notes",
                          let: { noteIds: "$notes" },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $in: ["$_id", { $ifNull: ["$$noteIds", []] }],
                                },
                              },
                            },
                          ],
                          as: "notes",
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
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
        fees: 1,
        features: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        trainer: 1,
        notes: 1,
        videolectures: 1,
        phases: 1,
      },
    },
  ]);

  if (!course?.length) {
    return sendError(res, 404, false, "Course not found");
  }

  return sendResponse(res, 200, true, "Course fetched", course[0]);
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
