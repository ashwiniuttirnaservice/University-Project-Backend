const Course = require("../models/Course");
const Trainer = require("../models/Trainer");

const Phase = require("../models/Phase");
const Week = require("../models/Week");
const Chapter = require("../models/Chapter");
const Lecture = require("../models/Lecture");
const Assignment = require("../models/Assignment");
const Note = require("../models/Note");
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
  const course = await Course.findById(req.params.id);

  if (!course) {
    return sendError(res, 404, false, "Course not found");
  }

  course.isActive = false;
  await course.save();

  return sendResponse(
    res,
    200,
    true,
    "Course deactivated successfully",
    course
  );
});

exports.getAllCourse = asyncHandler(async (req, res) => {
  const courses = await Course.find({})
    .select(
      "title duration features.certificate features.codingExercises features.recordedLectures batches"
    )
    .populate({
      path: "batches",
      select: "batchName startDate endDate mode status",
    })
    .lean();

  if (!courses.length) {
    return sendError(res, 404, false, "No courses found");
  }

  const order = { Upcoming: 1, Ongoing: 2, Completed: 3 };

  const withBatches = courses
    .filter((c) => c.batches && c.batches.length > 0)
    .map((c) => {
      c.batches.sort(
        (a, b) => (order[a.status] || 99) - (order[b.status] || 99)
      );
      return c;
    });

  const withoutBatches = courses.filter(
    (c) => !c.batches || c.batches.length === 0
  );

  withBatches.sort((a, b) => {
    const statusA = order[a.batches[0]?.status] || 99;
    const statusB = order[b.batches[0]?.status] || 99;
    return statusA - statusB;
  });

  const finalCourses = [...withBatches, ...withoutBatches];

  return sendResponse(res, 200, true, "Courses fetched", finalCourses);
});

exports.cloneCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Course ID");
  }

  // 🔹 1️⃣ Fetch the full course structure using aggregation instead of populate
  const [originalCourse] = await Course.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "phases",
        localField: "_id",
        foreignField: "course",
        as: "phases",
        pipeline: [
          {
            $lookup: {
              from: "weeks",
              localField: "_id",
              foreignField: "phase",
              as: "weeks",
              pipeline: [
                {
                  $lookup: {
                    from: "chapters",
                    localField: "_id",
                    foreignField: "week",
                    as: "chapters",
                    pipeline: [
                      {
                        $lookup: {
                          from: "lectures",
                          localField: "_id",
                          foreignField: "chapter",
                          as: "lectures",
                        },
                      },
                      {
                        $lookup: {
                          from: "assignments",
                          localField: "_id",
                          foreignField: "chapter",
                          as: "assignments",
                        },
                      },
                      {
                        $lookup: {
                          from: "notes",
                          localField: "_id",
                          foreignField: "chapter",
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
  ]);

  if (!originalCourse) {
    return sendError(res, 404, false, "Course not found to clone");
  }

  // 🔹 2️⃣ Create cloned course
  const clonedCourseData = {
    title: `${originalCourse.title} (Clone)`,
    description: originalCourse.description,
    duration: originalCourse.duration,
    branch: originalCourse.branch,
    rating: originalCourse.rating,
    enrolledCount: 0,
    overview: originalCourse.overview,
    learningOutcomes: originalCourse.learningOutcomes,
    benefits: originalCourse.benefits,
    keyFeatures: originalCourse.keyFeatures,
    features: originalCourse.features,
    trainer: originalCourse.trainer,
    fees: originalCourse.fees,
    isActive: false,
  };

  const clonedCourse = await Course.create(clonedCourseData);

  // 🔹 3️⃣ Clone nested data manually
  const clonedPhases = [];

  for (const phase of originalCourse.phases || []) {
    const newPhase = await Phase.create({
      course: clonedCourse._id,
      title: `${phase.title} (Clone)`,
    });

    const clonedWeeks = [];

    for (const week of phase.weeks || []) {
      const newWeek = await Week.create({
        phase: newPhase._id,
        title: `${week.title} (Clone)`,
        weekNumber: week.weekNumber || 1,
        course: clonedCourse._id,
      });

      const clonedChapters = [];

      for (const chapter of week.chapters || []) {
        const newChapter = await Chapter.create({
          course: clonedCourse._id,
          title: `${chapter.title} (Clone)`,
          description: chapter.description,
        });

        const clonedLectures = [];
        for (const lecture of chapter.lectures || []) {
          const newLecture = await Lecture.create({
            chapter: newChapter._id,
            title: `${lecture.title} (Clone)`,
            description: lecture.description,
            duration: lecture.duration,
            contentUrl: lecture.contentUrl,
            trainer: lecture.trainer,
            course: clonedCourse._id,
            status: "pending",
          });
          clonedLectures.push(newLecture._id);
        }

        newChapter.lectures = clonedLectures;
        await newChapter.save();
        clonedChapters.push(newChapter._id);
      }

      newWeek.chapters = clonedChapters;
      await newWeek.save();
      clonedWeeks.push(newWeek._id);
    }

    newPhase.weeks = clonedWeeks;
    await newPhase.save();
    clonedPhases.push(newPhase._id);
  }

  clonedCourse.phases = clonedPhases;
  await clonedCourse.save();

  return sendResponse(
    res,
    201,
    true,
    "Course cloned successfully",
    clonedCourse
  );
});
