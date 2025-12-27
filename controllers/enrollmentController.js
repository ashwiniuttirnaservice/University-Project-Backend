const mongoose = require("mongoose");
const Batch = require("../models/Batch");
const Course = require("../models/Course");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment.js");
exports.enrollInCourse = asyncHandler(async (req, res) => {
  const { course, studentId } = req.body;

  if (!course || !studentId) {
    return sendError(
      res,
      400,
      false,
      "Training  ID and Student ID are required"
    );
  }

  const courses = await Course.findById(course);
  if (!courses) return sendError(res, 404, false, "Training Program not found");

  const existing = await Enrollment.findOne({
    course: courses._id,
    studentId,
  });
  if (existing)
    return sendError(
      res,
      400,
      false,
      "Already enrolled in this Training Program"
    );

  const enrollment = await Enrollment.create({
    course: courses._id,
    studentId,
  });

  const populated = await Enrollment.findById(enrollment._id)
    .populate("studentId")
    .populate("course", "title description");

  return sendResponse(res, 201, true, "Participant  successfully", populated);
});

exports.getMyEnrollments = asyncHandler(async (req, res) => {
  const studentId = req.user?.studentId;

  if (!studentId) {
    return sendError(res, 401, false, "Student not authorized");
  }

  const enrollments = await Enrollment.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "enrolledCourses",
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

  return sendResponse(res, 200, true, "All Participant  fetched", enrollments);
});
exports.deleteEnrollment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Enrollment ID");
  }

  const enrollment = await Enrollment.findById(id);
  if (!enrollment) return sendError(res, 404, false, "Enrollment not found");

  // Soft delete enrollment
  enrollment.isActive = false;
  await enrollment.save();

  // Soft delete linked student
  const student = await Student.findById(enrollment.studentId);
  if (student) {
    student.isActive = false;
    await student.save();
  }

  // Remove student from all batches
  await Batch.updateMany(
    { "students.studentId": enrollment.studentId },
    {
      $pull: {
        students: { studentId: enrollment.studentId },
        enrolledIds: enrollment.studentId,
      },
      $inc: { studentCount: -1 },
    }
  );

  return sendResponse(
    res,
    200,
    true,
    "Enrollment and linked Student soft deleted, removed from batches successfully",
    { enrollment, student }
  );
});

exports.markContentAsComplete = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { contentId } = req.body;
  const userId = req.user.id;

  if (!contentId) return sendError(res, 400, false, "Content ID is required");

  const enrollment = await Enrollment.findById(enrollmentId).populate("course");
  if (!enrollment) return sendError(res, 404, false, "Participant  not found");
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
  if (!enrollment) return sendError(res, 404, false, "Participant  not found");
  if (enrollment.user.toString() !== userId)
    return sendError(res, 403, false, "Unauthorized");

  enrollment.completedContent = enrollment.completedContent.filter(
    (id) => id.toString() !== contentId
  );
  await enrollment.save();

  return sendResponse(res, 200, true, "Content marked incomplete", enrollment);
});

exports.getAllEnrollmentsAdmin = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ isActive: true })
    .populate({
      path: "studentId",
      match: { isActive: true },
      select:
        "fullName email mobileNo selectedProgram enrolledCourses coursesInterested profilePhotoStudent registeredAt",
    })
    .populate({
      path: "enrolledCourses",
      match: { isActive: true },
      select: "title category duration",
    })
    .populate({
      path: "enrolledBatches",
      match: { isActive: true },
      select: "batchName timing trainers",
      populate: {
        path: "trainer",
        match: { isActive: true },
        select: "firstName lastName email",
      },
    })
    .sort({ enrolledAt: -1 });

  if (!enrollments || enrollments.length === 0) {
    return sendResponse(
      res,
      200,
      true,
      "All Participant fetched successfully.",
      []
    );
  }

  const formattedResponse = enrollments.map((enrollment) => ({
    student: {
      _id: enrollment.studentId?._id,
      fullName: enrollment.studentId?.fullName || enrollment.fullName,
      email: enrollment.studentId?.email || enrollment.email,
      mobileNo: enrollment.studentId?.mobileNo || enrollment.mobileNo,
      selectedProgram:
        enrollment.studentId?.selectedProgram ||
        enrollment.enrolledCourses?.[0]?.title ||
        "",
      enrolledCourses: enrollment.studentId?.enrolledCourses?.length
        ? enrollment.studentId.enrolledCourses
        : enrollment.enrolledCourses.map((c) => ({
            _id: c._id,
            title: c.title,
          })),
      coursesInterested: enrollment.studentId?.coursesInterested || [],
      profilePhotoStudent: enrollment.studentId?.profilePhotoStudent || "",
      registeredAt: enrollment.studentId?.registeredAt || enrollment.createdAt,
      __v: enrollment.studentId?.__v || 0,
    },
    enrollment: {
      _id: enrollment._id,
      studentId: enrollment.studentId?._id,
      enrolledCourses: enrollment.enrolledCourses.map((c) => ({
        _id: c._id,
        title: c.title,
      })),
      enrolledBatches: enrollment.enrolledBatches.map((b) => ({
        _id: b._id,
        batchName: b.batchName,
        timing: b.timing,
        trainers: b.trainers?.map((t) => ({
          _id: t._id,
          fullName: `${t.firstName} ${t.lastName}`.trim(),
          email: t.email,
        })),
      })),
      coursesInterested: enrollment.coursesInterested,
      fullName: enrollment.fullName,
      mobileNo: enrollment.mobileNo,
      email: enrollment.email,
      enrolledAt: enrollment.enrolledAt,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      __v: enrollment.__v || 0,
    },
  }));

  return sendResponse(
    res,
    200,
    true,
    "All Participant fetched successfully.",
    formattedResponse
  );
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
    return sendError(res, 404, false, "Participant  not found");
  }

  return sendResponse(res, 200, true, "Participant  fetched", enrollment[0]);
});

exports.unenrollFromCourse = asyncHandler(async (req, res) => {
  const enrollmentId = req.params.id;
  const currentUser = req.user;

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) return sendError(res, 404, false, "Participant  not found");

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
  const {
    fullName,
    mobileNo,
    email,
    collegeName,
    enrolledCourses,
    enrolledBatches,
  } = req.body;

  if (!mobileNo) {
    return sendError(res, 400, false, "Mobile number is required");
  }

  let student = await Student.findOne({ mobileNo });
  let enrollment;

  if (student) {
    let updated = false;

    if (enrolledCourses && enrolledCourses.length > 0) {
      const newCourses = enrolledCourses.filter(
        (course) => !student.enrolledCourses.includes(course)
      );
      if (newCourses.length > 0) {
        student.enrolledCourses.push(...newCourses);
        updated = true;
      }
    }

    if (enrolledBatches && enrolledBatches.length > 0) {
      const newBatches = enrolledBatches.filter(
        (batch) => !student.enrolledBatches.includes(batch)
      );
      if (newBatches.length > 0) {
        student.enrolledBatches.push(...newBatches);
        updated = true;
      }
    }

    if (!updated) {
      enrollment = await Enrollment.findOne({ studentId: student._id });
      return sendResponse(
        res,
        200,
        true,
        "Student already enrolled in same Training Program(s)/batch(es).",
        {
          student,
          enrollment,
        }
      );
    }

    await student.save();

    enrollment = await Enrollment.findOne({ studentId: student._id });
    if (enrollment) {
      enrollment.enrolledCourses = student.enrolledCourses;
      enrollment.enrolledBatches = student.enrolledBatches;
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({
        studentId: student._id,
        fullName: student.fullName,
        mobileNo: student.mobileNo,
        email: student.email,
        collegeName: student.collegeName,
        enrolledCourses: student.enrolledCourses,
        enrolledBatches: student.enrolledBatches,
      });
    }

    return sendResponse(
      res,
      200,
      true,
      "Student Participant  updated successfully.",
      {
        student,
        enrollment,
      }
    );
  }

  if (!fullName || !email || !enrolledCourses) {
    return sendError(
      res,
      400,
      false,
      "All required fields must be filled for new enrollment."
    );
  }

  student = await Student.create({
    fullName,
    mobileNo,
    email,
    collegeName,
    enrolledCourses,
    enrolledBatches,
  });

  enrollment = await Enrollment.create({
    studentId: student._id,
    fullName,
    mobileNo,
    email,
    collegeName,
    enrolledCourses,
    enrolledBatches,
  });

  return sendResponse(res, 201, true, "Participant  created successfully", {
    student,
    enrollment,
  });
});

exports.createStudentEnrollmentByAdmin = asyncHandler(async (req, res) => {
  const {
    fullName,
    mobileNo,
    email,
    password,
    enrolledCourses,
    enrolledBatches,
    designation,
    collegeName,
  } = req.body;

  if (!fullName || !email || !enrolledCourses || !enrolledBatches) {
    return sendError(
      res,
      400,
      false,
      "Required fields: fullName, email, enrolledCourses, enrolledBatches"
    );
  }

  const profilePhotoStudent = req.file ? req.file.filename : "";

  // Convert to array if comma-separated string
  const enrolledCoursesArray = Array.isArray(enrolledCourses)
    ? enrolledCourses
    : enrolledCourses.split(",");

  const enrolledBatchesArray = Array.isArray(enrolledBatches)
    ? enrolledBatches
    : enrolledBatches.split(",");

  // Check if student already exists
  let student = await Student.findOne({ email });

  if (!student) {
    student = await Student.create({
      fullName,
      mobileNo,
      email,
      password,
      role: "student",
      status: "Enrolled",
      isActive: true,
      enrolledCourses: enrolledCoursesArray.map(
        (id) => new mongoose.Types.ObjectId(id)
      ),
    });
  } else {
    student.fullName = fullName;
    student.mobileNo = mobileNo;
    student.status = "Enrolled";
    student.isActive = true;
    student.enrolledCourses = Array.from(
      new Set([
        ...student.enrolledCourses.map((id) => id.toString()),
        ...enrolledCoursesArray,
      ])
    ).map((id) => new mongoose.Types.ObjectId(id));
    await student.save();
  }

  // Check if active enrollment exists
  const existingEnrollment = await Enrollment.findOne({
    studentId: student._id,
    isActive: true,
  });

  if (existingEnrollment) {
    return sendError(res, 400, false, "Student already enrolled");
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    studentId: student._id, // ✅ studentId link
    fullName,
    mobileNo,
    email,
    password,
    designation,
    collegeName,
    profilePhotoStudent,
    enrolledCourses: enrolledCoursesArray.map(
      (id) => new mongoose.Types.ObjectId(id)
    ),
    enrolledBatches: enrolledBatchesArray.map(
      (id) => new mongoose.Types.ObjectId(id)
    ),
    enrolledAt: new Date(),
    isActive: true,
  });

  // Add student to batches
  for (const batchId of enrolledBatchesArray) {
    await Batch.findByIdAndUpdate(
      batchId,
      {
        $addToSet: {
          enrolledIds: student._id,
          students: {
            studentId: student._id,
            fullName: student.fullName,
            email: student.email,
          },
        },
        $inc: { studentCount: 1 },
      },
      { new: true }
    );
  }

  return sendResponse(
    res,
    201,
    true,
    "Student successfully enrolled by admin",
    {
      student,
      enrollment,
    }
  );
});

exports.updateStudentEnrollmentByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    fullName,
    mobileNo,
    email,
    password,
    enrolledCourses,
    enrolledBatches,
    designation,
    collegeName,
  } = req.body;

  if (!id) {
    return sendError(res, 400, false, "Participant ID is required");
  }

  const existingEnrollment = await Enrollment.findById(id);
  if (!existingEnrollment) {
    return sendError(res, 404, false, "Participant not found");
  }

  let profilePhotoStudent = existingEnrollment.profilePhotoStudent;
  if (req.file) {
    profilePhotoStudent = req.file.filename;
  }

  let student = null;

  if (existingEnrollment.studentId) {
    student = await Student.findById(existingEnrollment.studentId);
  }

  if (!student) {
    student = await Student.create({
      fullName: fullName || existingEnrollment.fullName,
      mobileNo: mobileNo || existingEnrollment.mobileNo,
      email: email || existingEnrollment.email,
      password: password || undefined,
    });

    existingEnrollment.studentId = student._id;
  }

  student.fullName = fullName || student.fullName;
  student.mobileNo = mobileNo || student.mobileNo;
  student.email = email || student.email;
  if (password) student.password = password;
  await student.save();

  const newEnrolledCourses = Array.isArray(enrolledCourses)
    ? enrolledCourses
    : enrolledCourses
    ? enrolledCourses.split(",")
    : existingEnrollment.enrolledCourses.map((id) => id.toString());

  const newEnrolledBatches = Array.isArray(enrolledBatches)
    ? enrolledBatches
    : enrolledBatches
    ? enrolledBatches.split(",")
    : existingEnrollment.enrolledBatches.map((id) => id.toString());

  const oldBatchIds = existingEnrollment.enrolledBatches.map((id) =>
    id.toString()
  );

  existingEnrollment.fullName = student.fullName;
  existingEnrollment.mobileNo = student.mobileNo;
  existingEnrollment.email = student.email;
  if (password) existingEnrollment.password = password;
  existingEnrollment.designation =
    designation || existingEnrollment.designation;
  existingEnrollment.collegeName =
    collegeName || existingEnrollment.collegeName;
  existingEnrollment.profilePhotoStudent = profilePhotoStudent;

  existingEnrollment.enrolledCourses = newEnrolledCourses.map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  existingEnrollment.enrolledBatches = newEnrolledBatches.map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  existingEnrollment.updatedAt = new Date();
  await existingEnrollment.save();

  const removedBatches = oldBatchIds.filter(
    (id) => !newEnrolledBatches.includes(id)
  );

  if (removedBatches.length > 0) {
    await Batch.updateMany(
      { _id: { $in: removedBatches } },
      {
        $pull: {
          enrolledIds: student._id,
          students: { studentId: student._id },
        },
        $inc: { studentCount: -1 },
      }
    );
  }

  const addedBatches = newEnrolledBatches.filter(
    (id) => !oldBatchIds.includes(id)
  );

  for (const batchId of addedBatches) {
    await Batch.findByIdAndUpdate(
      batchId,
      {
        $addToSet: { enrolledIds: student._id },
        $inc: { studentCount: 1 },
        $push: {
          students: {
            studentId: student._id,
            fullName: student.fullName,
            email: student.email,
            mobileNo: student.mobileNo,
          },
        },
      },
      { new: true }
    );
  }

  await Batch.updateMany(
    { "students.studentId": student._id },
    {
      $set: {
        "students.$[elem].fullName": student.fullName,
        "students.$[elem].email": student.email,
        "students.$[elem].mobileNo": student.mobileNo,
      },
    },
    { arrayFilters: [{ "elem.studentId": student._id }] }
  );

  return sendResponse(
    res,
    200,
    true,
    "Student Participant updated successfully",
    {
      student,
      enrollment: existingEnrollment,
    }
  );
});

exports.getEnrollmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Participant  ID");
  }

  const enrollmentId = new mongoose.Types.ObjectId(id);

  const enrollment = await Enrollment.aggregate([
    { $match: { _id: enrollmentId } },

    {
      $lookup: {
        from: "courses",
        localField: "enrolledCourses",
        foreignField: "_id",
        as: "enrolledCourses",
      },
    },

    {
      $lookup: {
        from: "batches",
        localField: "enrolledBatches",
        foreignField: "_id",
        as: "enrolledBatches",
      },
    },

    {
      $lookup: {
        from: "attendances",
        let: { studentId: "$studentId" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$$studentId", "$attendees.student"] },
            },
          },

          {
            $lookup: {
              from: "meetings",
              localField: "meeting",
              foreignField: "_id",
              as: "meeting",
            },
          },
          { $unwind: { path: "$meeting", preserveNullAndEmptyArrays: true } },

          {
            $lookup: {
              from: "batches",
              localField: "batch",
              foreignField: "_id",
              as: "batch",
            },
          },
          { $unwind: { path: "$batch", preserveNullAndEmptyArrays: true } },

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
              from: "courses",
              localField: "course",
              foreignField: "_id",
              as: "course",
            },
          },
          { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },

          {
            $addFields: {
              studentAttendance: {
                $filter: {
                  input: "$attendees",
                  as: "att",
                  cond: { $eq: ["$$att.student", "$$studentId"] },
                },
              },
            },
          },

          { $project: { attendees: 0 } },
        ],
        as: "attendance",
      },
    },

    {
      $lookup: {
        from: "events",
        localField: "enrolledBatches",
        foreignField: "batch",
        as: "events",
      },
    },

    {
      $lookup: {
        from: "webinars",
        localField: "enrolledCourses",
        foreignField: "course",
        as: "webinars",
      },
    },

    {
      $lookup: {
        from: "internships",
        localField: "studentId",
        foreignField: "student",
        as: "internships",
      },
    },

    {
      $lookup: {
        from: "workshops",
        localField: "enrolledCourses",
        foreignField: "course",
        as: "workshops",
      },
    },

    {
      $lookup: {
        from: "assignments",
        let: { enrollmentId: "$_id" },
        pipeline: [
          { $unwind: "$submissions" },
          {
            $match: {
              $expr: { $eq: ["$submissions.student", "$$enrollmentId"] },
            },
          },
          {
            $project: {
              fullName: 1,
              mobileNo: 1,
              email: 1,
              designation: 1,
              collegeName: 1,
              profilePhotoStudent: 1,
              coursesInterested: 1,
              enrolledCourses: 1,
              enrolledBatches: 1,
              attendance: 1,
              events: 1,
              webinars: 1,
              internships: 1,
              workshops: 1,
              assignmentSubmissions: 1,
              enrolledAt: 1,
              studentId: 1,
            },
          },
        ],
        as: "assignmentSubmissions",
      },
    },
  ]);

  if (!enrollment || enrollment.length === 0) {
    return sendError(res, 404, false, "Participant  not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Participant  details fetched successfully",
    enrollment[0]
  );
});

const xlsx = require("xlsx");

exports.uploadEnrollmentExcel = asyncHandler(async (req, res) => {
  const rows = req.body.excelData;

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return sendError(res, 400, false, "No student data received");
  }

  const enrolledCourseIds = req.body.enrolledCourses
    ? []
        .concat(req.body.enrolledCourses)
        .map((id) => new mongoose.Types.ObjectId(id))
    : [];

  const enrolledBatchIds = req.body.enrolledBatches
    ? []
        .concat(req.body.enrolledBatches)
        .map((id) => new mongoose.Types.ObjectId(id))
    : [];

  if (!enrolledCourseIds.length || !enrolledBatchIds.length) {
    return sendError(res, 400, false, "Course and Batch are required");
  }

  const summary = {
    createdStudents: 0,
    newEnrollments: 0,
    addedToBatch: 0,
    skippedDuplicateStudents: 0,
    skippedStudents: [],
  };

  for (const row of rows) {
    const email = row.email?.toString().trim().toLowerCase();
    if (!email) continue;

    let student = await Student.findOne({ email });

    if (!student) {
      const password =
        row.password?.toString().trim() || Math.random().toString(36).slice(-8);

      student = await Student.create({
        fullName: row.fullName || "",
        email,
        mobileNo: row.mobileNo || "",
        password,
        designation: row.designation || "",
        collegeName: row.collegeName || "",
        role: "student",
        isActive: true,
      });

      summary.createdStudents++;
    }

    let enrollment = await Enrollment.findOne({ studentId: student._id });

    if (enrollment) {
      const alreadyHasCourses = enrolledCourseIds.every((courseId) =>
        enrollment.enrolledCourses.some((c) => c.equals(courseId))
      );

      const alreadyHasBatches = enrolledBatchIds.every((batchId) =>
        enrollment.enrolledBatches.some((b) => b.equals(batchId))
      );

      if (alreadyHasCourses && alreadyHasBatches) {
        summary.skippedDuplicateStudents++;
        summary.skippedStudents.push({
          fullName: student.fullName,
          email: student.email,
          mobileNo: student.mobileNo,
          reason: "Already enrolled in same course and batch",
        });
        continue;
      }
    }

    if (!enrollment) {
      enrollment = await Enrollment.create({
        studentId: student._id,
        fullName: student.fullName,
        email: student.email,
        mobileNo: student.mobileNo,
        designation: student.designation,
        collegeName: student.collegeName,
        enrolledCourses: enrolledCourseIds,
        enrolledBatches: enrolledBatchIds,
        password: student.password,
      });

      summary.newEnrollments++;
    } else {
      enrollment.enrolledCourses = [
        ...new Set(
          [...enrollment.enrolledCourses, ...enrolledCourseIds].map((id) =>
            id.toString()
          )
        ),
      ].map((id) => new mongoose.Types.ObjectId(id));

      enrollment.enrolledBatches = [
        ...new Set(
          [...enrollment.enrolledBatches, ...enrolledBatchIds].map((id) =>
            id.toString()
          )
        ),
      ].map((id) => new mongoose.Types.ObjectId(id));

      await enrollment.save();
    }

    for (const batchId of enrolledBatchIds) {
      const batch = await Batch.findById(batchId);
      if (!batch) continue;

      if (!batch.students.some((s) => s.studentId.equals(student._id))) {
        batch.students.push({
          studentId: student._id,
          fullName: student.fullName,
          email: student.email,
        });
      }

      if (!batch.enrolledIds.some((id) => id.equals(enrollment._id))) {
        batch.enrolledIds.push(enrollment._id);
      }

      batch.studentCount = batch.students.length;
      await batch.save();
      summary.addedToBatch++;
    }
  }

  return sendResponse(
    res,
    200,
    true,
    "Students imported successfully",
    summary
  );
});
