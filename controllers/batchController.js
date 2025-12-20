const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const Batch = require("../models/Batch");
const Student = require("../models/Student");
const { sendResponse, sendError } = require("../utils/apiResponse");
const Trainer = require("../models/Trainer");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

exports.createBatchWithCloudLabs = asyncHandler(async (req, res) => {
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
    trainer,
    additionalNotes,
    durationPerDayHours,
    cloudLabsLink,
  } = req.body;

  const batchData = {
    batchName,
    time,
    days,
    mode,
    startDate,
    endDate,
    status,
    isEnrolled,
    coursesAssigned,
    trainer,
    additionalNotes,
    durationPerDayHours: durationPerDayHours || 1,
  };

  if (req.file || cloudLabsLink) {
    batchData.cloudLabs = {
      link: cloudLabsLink || null,
      excelFile: req.file
        ? {
            fileName: req.file.originalname,
            fileUrl: req.file.path,
            uploadedAt: new Date(),
          }
        : null,
      students: [],
    };
  }

  const batch = await Batch.create(batchData);

  if (Array.isArray(trainer) && trainer.length > 0) {
    await Trainer.updateMany(
      { _id: { $in: trainer } },
      { $addToSet: { batches: batch._id } }
    );
  }

  if (Array.isArray(coursesAssigned) && coursesAssigned.length > 0) {
    await Course.updateMany(
      { _id: { $in: coursesAssigned } },
      { $addToSet: { batches: batch._id } }
    );
  }

  if (req.file) {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet);

    if (!rows || rows.length === 0)
      return sendError(res, 400, false, "Excel is empty");

    let added = 0;
    let skipped = 0;

    batch.cloudLabs.students = batch.cloudLabs.students || [];

    for (const row of rows) {
      const email = (row.email || "").trim().toLowerCase();
      const username = (row.username || "").trim();
      const password = (row.password || "").trim();

      if (!username || !password || !email) {
        skipped++;
        continue;
      }

      const exists = batch.cloudLabs.students.some(
        (s) => s.username === username || s.email === email
      );

      if (exists) {
        skipped++;
        continue;
      }

      batch.cloudLabs.students.push({
        email,
        username,
        password,
      });

      added++;
    }

    await batch.save();

    return sendResponse(
      res,
      201,
      true,
      "Batch created with CloudLabs successfully",
      {
        batchId: batch._id,
        cloudLabsLink: batch.cloudLabs.link,
        totalStudents: batch.cloudLabs.students.length,
        added,
        skipped,
      }
    );
  }

  // If no cloudLabs, return batch info
  return sendResponse(
    res,
    201,
    true,
    "Batch created successfully (without CloudLabs)",
    {
      batchId: batch._id,
    }
  );
});

exports.getAllBatches = asyncHandler(async (req, res) => {
  const batches = await Batch.aggregate([
    { $match: { isActive: true } },

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
        localField: "trainer",
        foreignField: "_id",
        as: "trainer",
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
        trainer: { _id: 1, fullName: 1, email: 1 },
      },
    },
  ]);

  return sendResponse(res, 200, true, "Batches fetched successfully", batches);
});

exports.getAllBatches1 = asyncHandler(async (req, res) => {
  const matchStage =
    req.roleFilter && Object.keys(req.roleFilter).length > 0
      ? { $match: req.roleFilter }
      : { $match: { isActive: true } };

  const batches = await Batch.aggregate([
    matchStage,
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
        localField: "trainer",
        foreignField: "_id",
        as: "trainer",
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
        isActive: 1,
        coursesAssigned: { _id: 1, title: 1 },
        trainer: { _id: 1, fullName: 1, email: 1 },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  if (!batches || batches.length === 0) {
    return sendError(res, 404, false, "No active batches found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Active batches fetched successfully",
    batches
  );
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
        localField: "trainer",
        foreignField: "_id",
        as: "trainer",
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
        trainer: { _id: 1, fullName: 1, email: 1 },
      },
    },
  ]);

  if (!batches || batches.length === 0) {
    return sendError(res, 404, false, "No batches found for this course");
  }

  return sendResponse(res, 200, true, "Batches fetched successfully", batches);
});

exports.getBatchesByTrainerId = asyncHandler(async (req, res) => {
  const trainerId = new mongoose.Types.ObjectId(req.params.trainerId);

  const batches = await Batch.aggregate([
    {
      $match: {
        trainersAssigned: { $in: [trainerId] },
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
        localField: "trainer",
        foreignField: "_id",
        as: "trainer",
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
        trainer: { _id: 1, fullName: 1, email: 1 },
      },
    },
  ]);

  if (!batches || batches.length === 0) {
    return sendError(res, 404, false, "No batches found for this trainer");
  }

  return sendResponse(res, 200, true, "Batches fetched successfully", batches);
});

exports.getBatchById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let studentId = req.user?.studentId;

  if (!studentId && req.query.studentId) {
    studentId = req.query.studentId;
  }

  if (!studentId) {
    return sendError(res, 401, false, "Student not authenticated");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Batch ID format");
  }

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return sendError(res, 400, false, "Invalid Student ID format");
  }

  const batchId = new mongoose.Types.ObjectId(id);
  const studentObjectId = new mongoose.Types.ObjectId(studentId);

  const batch = await Batch.aggregate([
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
        localField: "trainer",
        foreignField: "_id",
        as: "trainer",
      },
    },

    {
      $lookup: {
        from: "prerequisites",
        localField: "prerequisites",
        foreignField: "_id",
        as: "prerequisites",
      },
    },

    {
      $lookup: {
        from: "feedbackquestions",
        localField: "_id",
        foreignField: "batchId",
        as: "feedbacks",
      },
    },

    {
      $lookup: {
        from: "feedbacks",
        let: {
          batchId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$batchId", "$$batchId"] },
                  { $eq: ["$studentId", studentObjectId] },
                  { $eq: ["$status", 1] },
                ],
              },
            },
          },
        ],
        as: "allStudentFeedbacks",
      },
    },

    {
      $addFields: {
        feedbacks: {
          $map: {
            input: { $ifNull: ["$feedbacks", []] },
            as: "fb",
            in: {
              $let: {
                vars: {
                  studentFB: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$allStudentFeedbacks",
                          as: "sf",
                          cond: {
                            $eq: ["$$sf.feedbackQuestionId", "$$fb._id"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: {
                  _id: "$$fb._id",
                  title: "$$fb.title",

                  nps: {
                    $mergeObjects: [
                      "$$fb.nps",
                      { $ifNull: ["$$studentFB.nps", {}] },
                    ],
                  },

                  questions: {
                    $map: {
                      input: { $ifNull: ["$$fb.questions", []] },
                      as: "q",
                      in: {
                        $mergeObjects: [
                          "$$q",
                          {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: {
                                    $ifNull: ["$$studentFB.questions", []],
                                  },
                                  as: "sq",
                                  cond: {
                                    $eq: ["$$sq.question", "$$q.question"],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        ],
                      },
                    },
                  },

                  status: {
                    $cond: [{ $ifNull: ["$$studentFB", false] }, 1, 0],
                  },
                },
              },
            },
          },
        },
      },
    },

    {
      $project: {
        allStudentFeedbacks: 0,
      },
    },

    {
      $lookup: {
        from: "lectures",
        localField: "lectures",
        foreignField: "_id",
        as: "lectures",
      },
    },

    {
      $lookup: {
        from: "assignments",
        localField: "assignments",
        foreignField: "_id",
        as: "assignments",
      },
    },

    {
      $lookup: {
        from: "notes",
        localField: "notes",
        foreignField: "_id",
        as: "notes",
      },
    },

    {
      $lookup: {
        from: "testlists",
        let: { testIds: "$tests" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$testIds"] },
            },
          },

          {
            $lookup: {
              from: "iqtests",
              let: { testID: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$testID", "$$testID"] },
                        { $eq: ["$studentId", studentObjectId] },
                      ],
                    },
                  },
                },
              ],
              as: "iqtest",
            },
          },

          {
            $addFields: {
              attempted: {
                $cond: [
                  { $gt: [{ $size: "$iqtest" }, 0] },
                  { $arrayElemAt: ["$iqtest.status", 0] },
                  0,
                ],
              },

              iqtest: {
                $cond: [
                  { $gt: [{ $size: "$iqtest" }, 0] },
                  { $arrayElemAt: ["$iqtest", 0] },
                  null,
                ],
              },
            },
          },
        ],
        as: "tests",
      },
    },

    {
      $lookup: {
        from: "attendances",
        let: {
          batchId: "$_id",
          studentId: studentObjectId,
        },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$batch", "$$batchId"] },
            },
          },

          {
            $addFields: {
              studentAttendance: {
                $filter: {
                  input: "$attendees",
                  as: "att",
                  cond: {
                    $eq: ["$$att.student", "$$studentId"],
                  },
                },
              },
            },
          },

          {
            $match: {
              $expr: { $gt: [{ $size: "$studentAttendance" }, 0] },
            },
          },

          {
            $lookup: {
              from: "students",
              localField: "studentAttendance.student",
              foreignField: "_id",
              as: "student",
            },
          },

          {
            $project: {
              meeting: 1,
              course: 1,
              markedAt: 1,
              present: {
                $arrayElemAt: ["$studentAttendance.present", 0],
              },
              student: {
                _id: { $arrayElemAt: ["$student._id", 0] },
                fullName: { $arrayElemAt: ["$student.fullName", 0] },
              },
            },
          },
        ],
        as: "attendance",
      },
    },
    {
      $lookup: {
        from: "meetings",
        localField: "_id",
        foreignField: "batch",
        as: "meetings",
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
        durationPerDayHours: 1,
        cloudLabs: 1,
        status: 1,
        additionalNotes: 1,
        isActive: 1,
        isEnrolled: 1,
        studentCount: 1,
        students: 1,

        coursesAssigned: { _id: 1, title: 1 },
        trainer: { _id: 1, fullName: 1, email: 1 },
        prerequisites: { _id: 1, title: 1, description: 1, topics: 1 },
        feedbacks: 1,
        lectures: 1,
        assignments: 1,
        notes: 1,
        tests: 1,

        attendance: 1,

        meetings: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!batch || batch.length === 0) {
    return sendError(res, 404, false, "Batch not found");
  }

  return sendResponse(res, 200, true, "Batch fetched successfully", batch[0]);
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
        localField: "trainer",
        foreignField: "_id",
        as: "trainer",
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
        trainer: { _id: 1, fullName: 1, email: 1 },
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
      enrolledBatches: [],
      coursesInterested: [],
    });
  }

  if (batch) {
    if (batch.coursesAssigned?.length) {
      enrollment.enrolledCourses = [
        ...new Set([
          ...enrollment.enrolledCourses.map((c) => c.toString()),
          ...batch.coursesAssigned.map((c) => c._id.toString()),
        ]),
      ];
    }

    if (!enrollment.enrolledBatches.includes(batch._id)) {
      enrollment.enrolledBatches.push(batch._id);
    }

    const batchCourseIds =
      batch.coursesAssigned?.map((c) => c._id.toString()) || [];
    enrollment.coursesInterested = (enrollment.coursesInterested || []).filter(
      (c) => !batchCourseIds.includes(c.toString())
    );
  } else if (courseId) {
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
        localField: "trainer",
        foreignField: "_id",
        as: "trainer",
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
        trainer: { _id: 1, fullName: 1, email: 1 },
      },
    },
  ]);

  if (!batches || batches.length === 0) {
    return sendError(res, 404, false, "No batches found for this student.");
  }

  return sendResponse(res, 200, true, "Batches fetched successfully", batches);
});

exports.updateBatch = asyncHandler(async (req, res) => {
  const batchId = req.params.id;

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
    trainer,
    additionalNotes,
    durationPerDayHours,
  } = req.body;

  const batch = await Batch.findById(batchId);
  if (!batch) {
    return sendError(res, 404, false, "Batch not found");
  }

  if (batchName !== undefined) batch.batchName = batchName;
  if (time !== undefined) batch.time = time;
  if (days !== undefined) batch.days = days;
  if (mode !== undefined) batch.mode = mode;
  if (startDate !== undefined) batch.startDate = startDate;
  if (endDate !== undefined) batch.endDate = endDate;
  if (status !== undefined) batch.status = status;
  if (isEnrolled !== undefined) batch.isEnrolled = isEnrolled;
  if (additionalNotes !== undefined) batch.additionalNotes = additionalNotes;
  if (durationPerDayHours !== undefined)
    batch.durationPerDayHours = durationPerDayHours;

  if (Array.isArray(trainer)) {
    await Trainer.updateMany(
      { batches: batchId },
      { $pull: { batches: batchId } }
    );

    if (trainer.length > 0) {
      await Trainer.updateMany(
        { _id: { $in: trainer } },
        { $addToSet: { batches: batchId } }
      );
    }

    batch.trainer = trainer;
  }

  if (Array.isArray(coursesAssigned)) {
    await Course.updateMany(
      { batches: batchId },
      { $pull: { batches: batchId } }
    );

    if (coursesAssigned.length > 0) {
      await Course.updateMany(
        { _id: { $in: coursesAssigned } },
        { $addToSet: { batches: batchId } }
      );
    }

    batch.coursesAssigned = coursesAssigned;
  }

  await batch.save();

  return sendResponse(res, 200, true, "Batch updated successfully", batch);
});

exports.deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return sendError(res, 404, false, "Batch not found");
  }

  batch.isActive = false;
  await batch.save();

  return sendResponse(
    res,
    200,
    true,
    "Batch deleted (soft delete) successfully"
  );
});
const xlsx = require("xlsx");

exports.uploadEnrollmentExcel = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 400, false, "No Excel file uploaded");
  }

  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet);

  if (!rows || rows.length === 0) {
    return sendError(res, 400, false, "No student data found in Excel");
  }

  const parseIds = (input) => {
    if (!input) return [];
    if (typeof input === "string") {
      try {
        input = JSON.parse(input);
      } catch {
        input = [input];
      }
    }
    return [].concat(input).map((id) => new mongoose.Types.ObjectId(id));
  };

  const enrolledCourseIds = parseIds(req.body.enrolledCourses);
  const enrolledBatchIds = parseIds(req.body.enrolledBatches);

  if (!enrolledCourseIds.length || !enrolledBatchIds.length) {
    return sendError(res, 400, false, "Course and Batch are required");
  }

  const summary = {
    createdStudents: 0,
    skippedDuplicateStudents: 0,
    newEnrollments: 0,
    addedToBatch: 0,
  };

  for (const row of rows) {
    const fullName = (row.fullName || "").trim();
    const email = (row.email || "").trim().toLowerCase();
    const mobileNo = (row.mobileNo || "").toString().trim();

    if (!email) continue;

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      summary.skippedDuplicateStudents++;
      continue;
    }

    const password =
      row.password && row.password.toString().trim().length > 0
        ? row.password.toString().trim()
        : Math.random().toString(36).slice(-8);

    const student = await Student.create({
      fullName,
      email,
      mobileNo,
      collegeName: row.collegeName || "",
      designation: row.designation || "",
      password,
      role: "student",
      isActive: true,
    });

    summary.createdStudents++;

    const enrollmentDoc = await Enrollment.create({
      studentId: student._id,
      fullName: student.fullName,
      email: student.email,
      mobileNo: student.mobileNo,
      designation: student.designation,
      collegeName: student.collegeName,
      enrolledCourses: enrolledCourseIds,
      enrolledBatches: enrolledBatchIds,
    });

    summary.newEnrollments++;

    for (const batchId of enrolledBatchIds) {
      const batchUpdate = await Batch.findByIdAndUpdate(
        batchId,
        {
          $addToSet: {
            students: {
              studentId: student._id,
              fullName: student.fullName,
              email: student.email,
            },
            enrolledIds: enrollmentDoc._id,
          },
        },
        { new: true }
      );

      if (batchUpdate) summary.addedToBatch++;
    }
  }

  return sendResponse(
    res,
    200,
    true,
    "Excel upload completed successfully",
    summary
  );
});
