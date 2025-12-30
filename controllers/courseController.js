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

const parseJSON = (value) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch (err) {
    return value;
  }
};

exports.createCourse = asyncHandler(async (req, res) => {
  let {
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
    startDate,
    endDate,
    isActive,
    cloudLabsLink,
  } = req.body;

  learningOutcomes = parseJSON(learningOutcomes);
  benefits = parseJSON(benefits);
  keyFeatures = parseJSON(keyFeatures);
  features = parseJSON(features);
  trainer = parseJSON(trainer);

  let trainingPlan = null;
  if (req.file) {
    trainingPlan = {
      folderName: req.file.destination,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
    };
  }

  const courseImage = req.files?.courseImage?.[0]?.filename || "";

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
    courseImage,
    startDate,
    endDate,
    trainer,
    isActive,
    cloudLabsLink,
    trainingPlan,
  });

  if (trainer?.length) {
    await Trainer.updateMany(
      { _id: { $in: trainer } },
      { $addToSet: { courses: course._id } }
    );
  }

  return sendResponse(
    res,
    201,
    true,
    "Training Program created successfully",
    course
  );
});

exports.getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate("branch").populate("trainer");
  return sendResponse(res, 200, true, "All Training Program fetched", courses);
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
            { path: "lectures" },
            { path: "assignments" },
            { path: "notes" },
          ],
        },
      },
    })
    .lean();

  if (!course) {
    return sendError(res, 404, false, "Training Program not found");
  }

  return sendResponse(res, 200, true, "Training Program fetched", course);
});

exports.updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return sendError(res, 400, false, "Course ID is required.");
  }

  let {
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
    startDate,
    endDate,
    isActive,
    cloudLabsLink,
    trainingPlan,
  } = req.body;

  learningOutcomes = parseJSON(learningOutcomes);
  benefits = parseJSON(benefits);
  keyFeatures = parseJSON(keyFeatures);
  features = parseJSON(features);
  trainer = parseJSON(trainer);

  let updateData = {
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
    startDate,
    endDate,
    isActive,
    cloudLabsLink,
  };

  Object.keys(updateData).forEach(
    (key) => updateData[key] === undefined && delete updateData[key]
  );

  if (req.file) {
    updateData.trainingPlan = {
      folderName: req.file.destination,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
    };
  } else if (trainingPlan === "" || trainingPlan === null) {
    updateData.trainingPlan = null;
  }

  const course = await Course.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    return sendError(res, 404, false, "Training Program not found.");
  }

  return sendResponse(
    res,
    200,
    true,
    "Training Program updated successfully.",
    course
  );
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return sendError(res, 404, false, "Training Program not found");
  }

  course.isActive = false;
  await course.save();

  return sendResponse(
    res,
    200,
    true,
    "Training Program deactivated successfully",
    course
  );
});

exports.getAllCourse = asyncHandler(async (req, res) => {
  const baseMatch =
    req.roleFilter && Object.keys(req.roleFilter).length > 0
      ? { ...req.roleFilter, isActive: true }
      : { isActive: true };

  const courses = await Course.aggregate([
    { $match: baseMatch },

    {
      $lookup: {
        from: "trainers",
        localField: "trainer",
        foreignField: "_id",
        as: "trainer",
      },
    },
    { $unwind: { path: "$trainer", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "batches",
        localField: "batches",
        foreignField: "_id",
        pipeline: [
          { $match: { isActive: true } },
          {
            $project: {
              batchName: 1,
              startDate: 1,
              endDate: 1,
              mode: 1,
              status: 1,
            },
          },
        ],
        as: "batches",
      },
    },

    {
      $project: {
        title: 1,
        duration: 1,
        trainer: { fullName: 1, email: 1 },
        "features.certificate": 1,
        "features.codingExercises": 1,
        "features.recordedLectures": 1,
        batches: 1,
      },
    },
  ]);

  if (!courses.length) {
    return sendError(res, 404, false, "No Training Program found");
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

  return sendResponse(res, 200, true, "Training Program fetched", finalCourses);
});

exports.getAllCourse1 = asyncHandler(async (req, res) => {
  const courses = await Course.aggregate([
    { $match: { isActive: true } },

    {
      $lookup: {
        from: "trainers",
        localField: "trainer",
        foreignField: "_id",
        as: "trainer",
      },
    },
    { $unwind: { path: "$trainer", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "batches",
        localField: "batches",
        foreignField: "_id",
        pipeline: [
          { $match: { isActive: true } },
          {
            $project: {
              batchName: 1,
              startDate: 1,
              endDate: 1,
              mode: 1,
              status: 1,
            },
          },
        ],
        as: "batches",
      },
    },

    {
      $project: {
        title: 1,
        duration: 1,
        trainer: { fullName: 1, email: 1 },
        "features.certificate": 1,
        "features.codingExercises": 1,
        "features.recordedLectures": 1,
        batches: 1,
      },
    },
  ]);

  if (!courses.length) {
    return sendError(res, 404, false, "No Training Program found");
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

  return sendResponse(res, 200, true, "Training Program fetched", finalCourses);
});

exports.cloneCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Training Program ID");
  }

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
    return sendError(res, 404, false, "Training Program not found to clone");
  }

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
    startDate: originalCourse.startDate,
    endDate: originalCourse.endDate,
    isActive: true,
  };

  const clonedCourse = await Course.create(clonedCourseData);

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
    "Training Program cloned successfully",
    clonedCourse
  );
});
